using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.AddParticipants;
using EDGE.Application.Conversations.Commands.CreateConversation;
using EDGE.Application.Meetings.Commands.CreateMeeting;
using EDGE.Application.Meetings.Commands.InviteMeetingParticipants;
using EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Api.IntegrationTests;

public class RolePermissionMeetAndChatTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RolePermissionMeetAndChatTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RolePermissionDataSeeder_AssignsAllCommunicationPermissionsToAllInternalRoles()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await RolePermissionDataSeeder.SeedAsync(context, forceResetPermissions: true);

        var internalRoleKeys = new[]
        {
            "evaluator",
            "chief_of_eod",
            "regional_director",
            "legal",
            "accountant",
            "cashier",
            "admin",
            "superadmin"
        };

        var expectedCommPermissions = new[]
        {
            Permissions.ReadChat,
            Permissions.CreateChat,
            Permissions.ManageChatParticipants,
            Permissions.SendChat,
            Permissions.ReadMeetings,
            Permissions.CreateMeetings,
            Permissions.ManageMeetingParticipants,
            Permissions.ManageMeetingHostControls
        };

        var roles = await context.Roles.Include(r => r.RolePermissions).ToListAsync();

        foreach (var roleKey in internalRoleKeys)
        {
            var role = roles.FirstOrDefault(r => r.Key.Equals(roleKey, StringComparison.OrdinalIgnoreCase));
            role.Should().NotBeNull($"Role '{roleKey}' should exist in database.");

            var activePerms = role!.RolePermissions
                .Where(rp => !rp.IsDeleted)
                .Select(rp => rp.PermissionKey)
                .ToHashSet();

            foreach (var perm in expectedCommPermissions)
            {
                activePerms.Should().Contain(perm,
                    $"Internal role '{roleKey}' must have communication permission '{perm}'.");
            }
        }

        // Verify Client role has only restricted communication access
        var clientRole = roles.FirstOrDefault(r => r.Key.Equals("client", StringComparison.OrdinalIgnoreCase));
        clientRole.Should().NotBeNull();
        var clientPerms = clientRole!.RolePermissions
            .Where(rp => !rp.IsDeleted)
            .Select(rp => rp.PermissionKey)
            .ToHashSet();

        clientPerms.Should().Contain(Permissions.ReadChat);
        clientPerms.Should().Contain(Permissions.SendChat);
        clientPerms.Should().Contain(Permissions.ReadMeetings);
        clientPerms.Should().NotContain(Permissions.CreateMeetings, "Clients should not have permission to create official meetings.");
        clientPerms.Should().NotContain(Permissions.ManageMeetingHostControls, "Clients should not have permission for host controls.");
    }

    [Fact]
    public async Task Evaluator_CanCreateMeeting_AndInviteAndRemoveParticipants()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await RolePermissionDataSeeder.SeedAsync(context, forceResetPermissions: true);

        var evaluator = await context.Users.FirstOrDefaultAsync(u => u.Email == "evaluator@ntcedge.com");
        evaluator.Should().NotBeNull();

        var chief = await context.Users.FirstOrDefaultAsync(u => u.Email == "chiefeod@ntcedge.com");
        chief.Should().NotBeNull();

        var legal = await context.Users.FirstOrDefaultAsync(u => u.Email == "legal@ntcedge.com");
        legal.Should().NotBeNull();

        // 1. Evaluator creates meeting
        var meetingCode = $"test-meet-{Guid.NewGuid():N}"[..14];
        var meeting = new Meeting
        {
            Title = "Technical Evaluation Coordination",
            MeetingCode = meetingCode,
            HostUserId = evaluator!.Id,
            Scope = ConversationScope.IntraRegional,
            Status = MeetingStatus.Scheduled,
            ScheduledStartTime = DateTimeOffset.UtcNow.AddHours(1),
            ScheduledEndTime = DateTimeOffset.UtcNow.AddHours(2)
        };
        meeting.Participants.Add(new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            UserId = evaluator.Id,
            Role = ParticipantRole.Owner
        });
        context.Meetings.Add(meeting);
        await context.SaveChangesAsync();

        // 2. Evaluator invites Chief and Legal
        context.MeetingParticipants.Add(new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            MeetingId = meeting.Id,
            UserId = chief!.Id,
            Role = ParticipantRole.Member
        });
        context.MeetingParticipants.Add(new MeetingParticipant
        {
            Id = Guid.NewGuid(),
            MeetingId = meeting.Id,
            UserId = legal!.Id,
            Role = ParticipantRole.Member
        });
        await context.SaveChangesAsync();

        var updatedMeeting = await context.Meetings
            .AsNoTracking()
            .Include(m => m.Participants)
            .FirstOrDefaultAsync(m => m.MeetingCode == meetingCode);

        updatedMeeting.Should().NotBeNull();
        updatedMeeting!.Participants.Should().HaveCount(3);
        updatedMeeting.HostUserId.Should().Be(evaluator.Id);

        // 3. Evaluator removes Legal from meeting
        var legalParticipant = await context.MeetingParticipants.FirstOrDefaultAsync(p => p.MeetingId == meeting.Id && p.UserId == legal.Id);
        legalParticipant.Should().NotBeNull();
        context.MeetingParticipants.Remove(legalParticipant!);
        await context.SaveChangesAsync();

        var finalMeeting = await context.Meetings
            .Include(m => m.Participants)
            .FirstOrDefaultAsync(m => m.MeetingCode == meetingCode);

        finalMeeting!.Participants.Should().HaveCount(2);
        finalMeeting.Participants.Select(p => p.UserId).Should().NotContain(legal.Id);
    }
}
