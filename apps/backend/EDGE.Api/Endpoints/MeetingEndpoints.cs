using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.CloseMeetingPoll;
using EDGE.Application.Meetings.Commands.CreateMeeting;
using EDGE.Application.Meetings.Commands.CreateMeetingPoll;
using EDGE.Application.Meetings.Commands.ExecuteMeetingAction;
using EDGE.Application.Meetings.Commands.InviteMeetingParticipants;
using EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;
using EDGE.Application.Meetings.Commands.UpdateMeeting;
using EDGE.Application.Meetings.Commands.VoteMeetingPoll;
using EDGE.Application.Meetings.Queries.GetMeetings;
using EDGE.Application.Meetings.Queries.GetMeetingByCode;

namespace EDGE.Api.Endpoints;

public static class MeetingEndpoints
{
    public static RouteGroupBuilder MapMeetingEndpoints(this RouteGroupBuilder group)
    {
        var meet = group.MapGroup("meetings").WithTags("Meetings");

        meet.MapGet("/ice-servers", (IConfiguration configuration, ICurrentUserService currentUser) =>
        {
            var servers = new List<object>
            {
                new { urls = new[] { "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302" } },
                new { urls = new[] { "stun:stun.cloudflare.com:3478" } }
            };

            var turnUrlsRaw = configuration["TurnServer:Urls"];
            if (!string.IsNullOrWhiteSpace(turnUrlsRaw))
            {
                var turnUrls = turnUrlsRaw
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .ToArray();

                var sharedSecret = configuration["TurnServer:SharedSecret"];
                var staticUsername = configuration["TurnServer:Username"];
                var staticCredential = configuration["TurnServer:Credential"];

                if (!string.IsNullOrWhiteSpace(sharedSecret))
                {
                    var expiryUnix = DateTimeOffset.UtcNow.AddHours(12).ToUnixTimeSeconds();
                    var userTag = string.IsNullOrWhiteSpace(currentUser.UserId) ? "edge" : currentUser.UserId;
                    var ephemeralUsername = $"{expiryUnix}:{userTag}";
                    using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(sharedSecret));
                    var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(ephemeralUsername)));

                    servers.Add(new
                    {
                        urls = turnUrls,
                        username = ephemeralUsername,
                        credential = hash
                    });
                }
                else if (!string.IsNullOrWhiteSpace(staticUsername) && !string.IsNullOrWhiteSpace(staticCredential))
                {
                    servers.Add(new
                    {
                        urls = turnUrls,
                        username = staticUsername,
                        credential = staticCredential
                    });
                }
            }

            return Results.Ok(new { iceServers = servers });
        }).WithName("GetMeetingIceServers").RequireAuthorization();

        meet.MapGet("/", async ([FromQuery] Guid? tenantId, [FromQuery] string? filter, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMeetingsQuery(tenantId, filter));
            return Results.Ok(result);
        }).WithName("GetMeetings").RequireAuthorization();

        meet.MapGet("/{meetingCode}", async (string meetingCode, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMeetingByCodeQuery(meetingCode));
            return result != null ? Results.Ok(result) : Results.NotFound();
        }).WithName("GetMeetingByCode").RequireAuthorization();

        meet.MapPost("/", async (
            [FromBody] CreateMeetingCommand command,
            IValidator<CreateMeetingCommand> validator,
            IMediator mediator) =>
        {
            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/meetings/{result.MeetingCode}", result);
        }).WithName("CreateMeeting").RequireAuthorization();

        meet.MapPut("/{meetingCode}", async (
            string meetingCode,
            [FromBody] UpdateMeetingCommand command,
            IValidator<UpdateMeetingCommand> validator,
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        }).WithName("UpdateMeeting").RequireAuthorization();

        meet.MapPost("/{meetingCode}/participants", async (
            string meetingCode,
            [FromBody] InviteMeetingParticipantsCommand command,
            IValidator<InviteMeetingParticipantsCommand> validator,
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("InviteMeetingParticipants").RequireAuthorization();

        meet.MapDelete("/{meetingCode}/participants/{userId:guid}", async (
            string meetingCode,
            Guid userId,
            IValidator<RemoveMeetingParticipantCommand> validator,
            IMediator mediator) =>
        {
            var command = new RemoveMeetingParticipantCommand(meetingCode, userId);
            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(new { success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        }).WithName("RemoveMeetingParticipant").RequireAuthorization();

        meet.MapPost("/{meetingCode}/actions", async (
            string meetingCode,
            [FromBody] ExecuteMeetingActionCommand command,
            IValidator<ExecuteMeetingActionCommand> validator,
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(new { success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        }).WithName("ExecuteMeetingAction").RequireAuthorization();

        meet.MapPost("/{meetingCode}/polls", async (
            string meetingCode,
            [FromBody] CreateMeetingPollCommand command,
            IValidator<CreateMeetingPollCommand> validator,
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("CreateMeetingPoll").RequireAuthorization();

        meet.MapPost("/{meetingCode}/polls/{pollId:guid}/votes", async (
            string meetingCode,
            Guid pollId,
            [FromBody] VoteMeetingPollCommand command,
            IValidator<VoteMeetingPollCommand> validator,
            IMediator mediator) =>
        {
            command = command with { MeetingCode = meetingCode, PollId = pollId };

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        }).WithName("VoteMeetingPoll").RequireAuthorization();

        meet.MapPost("/{meetingCode}/polls/{pollId:guid}/close", async (
            string meetingCode,
            Guid pollId,
            IValidator<CloseMeetingPollCommand> validator,
            IMediator mediator) =>
        {
            var command = new CloseMeetingPollCommand(meetingCode, pollId);

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        }).WithName("CloseMeetingPoll").RequireAuthorization();

        return group;
    }
}
