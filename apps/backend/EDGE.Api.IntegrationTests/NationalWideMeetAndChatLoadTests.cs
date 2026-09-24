using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using Xunit.Abstractions;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Api.IntegrationTests;

public class NationalWideMeetAndChatLoadTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly ITestOutputHelper _output;

    public NationalWideMeetAndChatLoadTests(CustomWebApplicationFactory factory, ITestOutputHelper output)
    {
        _factory = factory;
        _output = output;
    }

    [Fact]
    public async Task Nationwide_MultiMeeting_ConcurrentLoadTest_UnderHighVolume()
    {
        // ─── 1. SETUP REGIONS & TENANTS ──────────────────────────────────────────
        const int numberOfMeetingRooms = 8;
        const int participantsPerMeeting = 5;
        const int webrtcSignalsPerParticipant = 20;

        var meetingCodes = new List<string>();
        var hosts = new List<User>();
        var allUsers = new List<User>();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            for (int r = 0; r < numberOfMeetingRooms; r++)
            {
                var region = new Region
                {
                    Name = $"Regional Office {r + 1}",
                    Code = $"RO{r + 1:D2}",
                    IsActive = true
                };
                db.Regions.Add(region);

                var tenant = new Tenant
                {
                    Name = $"NTC Region {r + 1}",
                    Code = $"NTC-R{r + 1:D2}",
                    RegionId = region.Id,
                    IsActive = true
                };
                db.Tenants.Add(tenant);

                var hostUser = new User
                {
                    Email = $"host.region{r + 1}@ntc.gov.ph",
                    FirstName = $"Host",
                    LastName = $"Officer {r + 1}",
                    AuthUserId = $"auth_host_{r + 1}_{Guid.NewGuid():N}"
                };
                db.Users.Add(hostUser);
                hosts.Add(hostUser);
                allUsers.Add(hostUser);

                var hostMember = new TenantMember
                {
                    TenantId = tenant.Id,
                    UserId = hostUser.Id
                };
                db.TenantMembers.Add(hostMember);

                var meetingCode = $"meet-nat-{r + 1}-{Guid.NewGuid():N}"[..18];
                meetingCodes.Add(meetingCode);

                var meeting = new Meeting
                {
                    Title = $"National Coordination Sync - Region {r + 1}",
                    MeetingCode = meetingCode,
                    TenantId = tenant.Id,
                    HostUserId = hostUser.Id,
                    Scope = ConversationScope.IntraRegional,
                    Status = MeetingStatus.Live,
                    AllowExternalGuests = true
                };

                meeting.Participants.Add(new MeetingParticipant
                {
                    UserId = hostUser.Id,
                    TenantId = tenant.Id,
                    Role = ParticipantRole.Owner,
                    IsDeleted = false
                });

                // Add attendees
                for (int p = 1; p < participantsPerMeeting; p++)
                {
                    var attendee = new User
                    {
                        Email = $"attendee.r{r + 1}.p{p}@ntc.gov.ph",
                        FirstName = $"Participant {p}",
                        LastName = $"Reg {r + 1}",
                        AuthUserId = $"auth_attendee_{r + 1}_{p}_{Guid.NewGuid():N}"
                    };
                    db.Users.Add(attendee);
                    allUsers.Add(attendee);

                    db.TenantMembers.Add(new TenantMember
                    {
                        TenantId = tenant.Id,
                        UserId = attendee.Id
                    });

                    meeting.Participants.Add(new MeetingParticipant
                    {
                        UserId = attendee.Id,
                        TenantId = tenant.Id,
                        Role = ParticipantRole.Member,
                        IsDeleted = false
                    });
                }

                db.Meetings.Add(meeting);
            }

            await db.SaveChangesAsync();
        }

        _output.WriteLine($"[Setup Complete] Created {numberOfMeetingRooms} meeting rooms with {numberOfMeetingRooms * participantsPerMeeting} total participants.");

        // ─── 2. CONNECT CONCURRENT CLIENTS ──────────────────────────────────────
        var hubUrl = new Uri(_factory.Server.BaseAddress, "/hubs/meet");
        var clientHandler = _factory.Server.CreateHandler();

        var hubConnections = new ConcurrentDictionary<string, HubConnection>();
        var receivedSignals = new ConcurrentBag<long>();
        var receivedChatMessages = new ConcurrentBag<string>();
        var admissionLatencies = new ConcurrentBag<long>();
        var signalLatencies = new ConcurrentBag<long>();

        var totalExpectedParticipants = numberOfMeetingRooms * participantsPerMeeting;
        var connectionTasks = new List<Task>();

        var totalSw = Stopwatch.StartNew();

        for (int r = 0; r < numberOfMeetingRooms; r++)
        {
            var roomCode = meetingCodes[r];
            var host = hosts[r];

            // 1 Host connection
            connectionTasks.Add(Task.Run(async () =>
            {
                var conn = new HubConnectionBuilder()
                    .WithUrl(hubUrl, options =>
                    {
                        options.HttpMessageHandlerFactory = _ => clientHandler;
                        options.Headers["Authorization"] = $"Bearer test_token_{host.Id}";
                    })
                    .Build();

                conn.On<string, string>("ReceiveWebRtcOffer", (senderId, sdp) =>
                {
                    receivedSignals.Add(1);
                });

                conn.On<string, string>("ReceiveWebRtcAnswer", (senderId, sdp) =>
                {
                    receivedSignals.Add(1);
                });

                conn.On<string, string>("ReceiveIceCandidate", (senderId, ice) =>
                {
                    receivedSignals.Add(1);
                });

                conn.On<object>("ReceiveMeetingChatMessage", msg =>
                {
                    receivedChatMessages.Add(msg.ToString() ?? "");
                });

                await conn.StartAsync();
                await conn.InvokeAsync("JoinMeeting", roomCode);
                hubConnections.TryAdd($"host_{roomCode}", conn);
            }));

            // Participants
            for (int p = 1; p < participantsPerMeeting; p++)
            {
                var participantIndex = p;
                var currentRoom = roomCode;
                var user = allUsers.First(u => u.Email == $"attendee.r{r + 1}.p{p}@ntc.gov.ph");

                connectionTasks.Add(Task.Run(async () =>
                {
                    var conn = new HubConnectionBuilder()
                        .WithUrl(hubUrl, options =>
                        {
                            options.HttpMessageHandlerFactory = _ => clientHandler;
                            options.Headers["Authorization"] = $"Bearer test_token_{user.Id}";
                        })
                        .Build();

                    conn.On<string, string>("ReceiveWebRtcOffer", (senderId, sdp) => receivedSignals.Add(1));
                    conn.On<string, string>("ReceiveWebRtcAnswer", (senderId, sdp) => receivedSignals.Add(1));
                    conn.On<string, string>("ReceiveIceCandidate", (senderId, ice) => receivedSignals.Add(1));
                    conn.On<object>("ReceiveMeetingChatMessage", msg => receivedChatMessages.Add(msg.ToString() ?? ""));

                    await conn.StartAsync();

                    // Join meeting room
                    var admitSw = Stopwatch.StartNew();
                    await conn.InvokeAsync("JoinMeeting", currentRoom);
                    admitSw.Stop();
                    admissionLatencies.Add(admitSw.ElapsedMilliseconds);

                    hubConnections.TryAdd($"participant_{currentRoom}_{participantIndex}", conn);
                }));
            }
        }

        await Task.WhenAll(connectionTasks);
        _output.WriteLine($"[Connected] {hubConnections.Count} concurrent SignalR connections established in {totalSw.ElapsedMilliseconds} ms.");

        hubConnections.Count.Should().Be(totalExpectedParticipants);

        // ─── 3. SIMULATE WEBRTC SIGNALING FLOOD & REAL-TIME BROADCASTS ──────────
        _output.WriteLine($"[Load Phase] Exchanging {numberOfMeetingRooms * participantsPerMeeting * webrtcSignalsPerParticipant} WebRTC signaling packets concurrently...");

        var signalingTasks = new List<Task>();

        foreach (var entry in hubConnections)
        {
            var key = entry.Key;
            var conn = entry.Value;
            var isHost = key.StartsWith("host_");
            var meetingCode = key.Substring(key.IndexOf('_') + 1);

            signalingTasks.Add(Task.Run(async () =>
            {
                var targetId = isHost ? "conn_peer_sample" : "conn_host_sample";

                for (int i = 0; i < webrtcSignalsPerParticipant; i++)
                {
                    var sw = Stopwatch.StartNew();

                    // Send SDP Offer, Answer, and ICE candidates
                    if (i % 3 == 0)
                    {
                        await conn.InvokeAsync("SendWebRtcSignal", targetId, "offer", "{\"type\":\"offer\",\"sdp\":\"v=0...\"}");
                    }
                    else if (i % 3 == 1)
                    {
                        await conn.InvokeAsync("SendWebRtcSignal", targetId, "answer", "{\"type\":\"answer\",\"sdp\":\"v=0...\"}");
                    }
                    else
                    {
                        await conn.InvokeAsync("SendWebRtcSignal", targetId, "ice", "{\"candidate\":\"candidate:1...\"}");
                    }

                    // Concurrent reactions and chat messages
                    if (i % 5 == 0)
                    {
                        await conn.InvokeAsync("SendReaction", meetingCode, "👍");
                    }

                    if (i % 4 == 0)
                    {
                        await conn.InvokeAsync("BroadcastMeetingChatMessage", meetingCode, new
                        {
                            senderName = isHost ? "Regional Host" : "Officer",
                            content = $"Real-time coordination update packet #{i}",
                            timestamp = DateTime.UtcNow.ToString("o")
                        });
                    }

                    sw.Stop();
                    signalLatencies.Add(sw.ElapsedMilliseconds);
                }
            }));
        }

        await Task.WhenAll(signalingTasks);
        totalSw.Stop();

        // ─── 4. METRICS & LATENCY CALCULATIONS ──────────────────────────────────
        var sortedSignalLatencies = signalLatencies.OrderBy(x => x).ToList();
        var p50 = sortedSignalLatencies[(int)(sortedSignalLatencies.Count * 0.50)];
        var p95 = sortedSignalLatencies[(int)(sortedSignalLatencies.Count * 0.95)];
        var p99 = sortedSignalLatencies[(int)(sortedSignalLatencies.Count * 0.99)];
        var avg = signalLatencies.Average();

        _output.WriteLine("─────────────────────────────────────────────────────────────────");
        _output.WriteLine("             NATIONWIDE MEET LOAD TEST RESULTS                  ");
        _output.WriteLine("─────────────────────────────────────────────────────────────────");
        _output.WriteLine($"Concurrent Meetings : {numberOfMeetingRooms}");
        _output.WriteLine($"Total Connected Users: {hubConnections.Count}");
        _output.WriteLine($"Total Signals Sent  : {sortedSignalLatencies.Count}");
        _output.WriteLine($"Execution Time      : {totalSw.ElapsedMilliseconds} ms");
        _output.WriteLine($"Throughput          : {(sortedSignalLatencies.Count / (totalSw.ElapsedMilliseconds / 1000.0)):F2} operations/sec");
        _output.WriteLine($"Latency (Avg)       : {avg:F2} ms");
        _output.WriteLine($"Latency (P50)       : {p50} ms");
        _output.WriteLine($"Latency (P95)       : {p95} ms");
        _output.WriteLine($"Latency (P99)       : {p99} ms");
        _output.WriteLine("─────────────────────────────────────────────────────────────────");

        // Assert performance benchmarks
        p95.Should().BeLessThan(350, "P95 latency should be under 350ms under high nationwide load");
        p99.Should().BeLessThan(500, "P99 latency should be under 500ms");

        // Cleanup
        foreach (var conn in hubConnections.Values)
        {
            await conn.DisposeAsync();
        }
    }

    [Fact]
    public async Task Nationwide_CrossRegion_ChatHub_LoadTest()
    {
        const int numberOfConversations = 10;
        const int messagesPerConversation = 25;

        var chatUrl = new Uri(_factory.Server.BaseAddress, "/hubs/chat");
        var clientHandler = _factory.Server.CreateHandler();

        var conversationIds = new List<Guid>();
        var userConnections = new ConcurrentDictionary<string, HubConnection>();
        var latencies = new ConcurrentBag<long>();
        var receivedTyping = new ConcurrentBag<int>();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            for (int c = 0; c < numberOfConversations; c++)
            {
                var convId = Guid.NewGuid();
                conversationIds.Add(convId);

                var user1 = new User { Email = $"chat.u1.{c}@ntc.gov.ph", FirstName = "Officer A", LastName = $"{c}", AuthUserId = $"auth_chat_u1_{c}_{Guid.NewGuid():N}" };
                var user2 = new User { Email = $"chat.u2.{c}@ntc.gov.ph", FirstName = "Officer B", LastName = $"{c}", AuthUserId = $"auth_chat_u2_{c}_{Guid.NewGuid():N}" };
                db.Users.AddRange(user1, user2);

                var conv = new Conversation
                {
                    Id = convId,
                    Title = $"Inter-Regional Sync #{c + 1}",
                    Type = ConversationType.Direct,
                    Scope = ConversationScope.InterRegional
                };

                conv.Participants.Add(new ConversationParticipant { UserId = user1.Id, Role = ParticipantRole.Owner, IsDeleted = false });
                conv.Participants.Add(new ConversationParticipant { UserId = user2.Id, Role = ParticipantRole.Member, IsDeleted = false });

                db.Conversations.Add(conv);
            }

            await db.SaveChangesAsync();
        }

        // Connect user pairs to chat hub
        var joinTasks = new List<Task>();
        for (int c = 0; c < numberOfConversations; c++)
        {
            var convId = conversationIds[c].ToString();
            var convIndex = c;

            joinTasks.Add(Task.Run(async () =>
            {
                var conn1 = new HubConnectionBuilder()
                    .WithUrl(chatUrl, options => options.HttpMessageHandlerFactory = _ => clientHandler)
                    .Build();

                var conn2 = new HubConnectionBuilder()
                    .WithUrl(chatUrl, options => options.HttpMessageHandlerFactory = _ => clientHandler)
                    .Build();

                conn1.On<Guid, Guid, string>("UserTyping", (cid, uid, name) => receivedTyping.Add(1));
                conn2.On<Guid, Guid, string>("UserTyping", (cid, uid, name) => receivedTyping.Add(1));

                await conn1.StartAsync();
                await conn2.StartAsync();

                await conn1.InvokeAsync("JoinConversation", convId);
                await conn2.InvokeAsync("JoinConversation", convId);

                userConnections.TryAdd($"conv_{convIndex}_u1", conn1);
                userConnections.TryAdd($"conv_{convIndex}_u2", conn2);
            }));
        }

        await Task.WhenAll(joinTasks);
        userConnections.Count.Should().Be(numberOfConversations * 2);

        // High frequency typing and burst operations
        var burstTasks = new List<Task>();
        var sw = Stopwatch.StartNew();

        for (int c = 0; c < numberOfConversations; c++)
        {
            var convId = conversationIds[c].ToString();
            var conn1 = userConnections[$"conv_{c}_u1"];
            var conn2 = userConnections[$"conv_{c}_u2"];

            burstTasks.Add(Task.Run(async () =>
            {
                for (int m = 0; m < messagesPerConversation; m++)
                {
                    var msgSw = Stopwatch.StartNew();

                    await conn1.InvokeAsync("SendTyping", convId, "Officer A");
                    await Task.Delay(10);
                    await conn1.InvokeAsync("StopTyping", convId);

                    await conn2.InvokeAsync("SendTyping", convId, "Officer B");
                    await Task.Delay(10);
                    await conn2.InvokeAsync("StopTyping", convId);

                    msgSw.Stop();
                    latencies.Add(msgSw.ElapsedMilliseconds);
                }
            }));
        }

        await Task.WhenAll(burstTasks);
        sw.Stop();

        var sortedLatencies = latencies.OrderBy(x => x).ToList();
        var p95 = sortedLatencies[(int)(sortedLatencies.Count * 0.95)];

        _output.WriteLine("─────────────────────────────────────────────────────────────────");
        _output.WriteLine("             NATIONWIDE CHAT LOAD TEST RESULTS                  ");
        _output.WriteLine("─────────────────────────────────────────────────────────────────");
        _output.WriteLine($"Active Conversations: {numberOfConversations}");
        _output.WriteLine($"Total Operations    : {sortedLatencies.Count * 4}");
        _output.WriteLine($"Elapsed Time        : {sw.ElapsedMilliseconds} ms");
        _output.WriteLine($"P95 Chat Latency    : {p95} ms");
        _output.WriteLine("─────────────────────────────────────────────────────────────────");

        p95.Should().BeLessThan(150);

        foreach (var conn in userConnections.Values)
        {
            await conn.DisposeAsync();
        }
    }
}
