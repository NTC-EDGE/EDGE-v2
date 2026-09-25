using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Meetings.Commands.CreateMeeting;
using EDGE.Application.Meetings.Commands.CreateMeetingPoll;
using EDGE.Application.Meetings.Commands.ExecuteMeetingAction;
using EDGE.Application.Meetings.Commands.InviteMeetingParticipants;
using EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;
using EDGE.Application.Meetings.Queries.GetMeetings;
using EDGE.Application.Meetings.Queries.GetMeetingByCode;

namespace EDGE.Api.Endpoints;

public static class MeetingEndpoints
{
    public static RouteGroupBuilder MapMeetingEndpoints(this RouteGroupBuilder group)
    {
        var meet = group.MapGroup("meetings").WithTags("Meetings");

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
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }
            var result = await mediator.Send(command);
            return Results.Ok(new { success = result });
        }).WithName("ExecuteMeetingAction").RequireAuthorization();

        meet.MapPost("/{meetingCode}/polls", async (
            string meetingCode,
            [FromBody] CreateMeetingPollCommand command,
            IMediator mediator) =>
        {
            if (command.MeetingCode != meetingCode)
            {
                command = command with { MeetingCode = meetingCode };
            }
            var result = await mediator.Send(command);
            return Results.Ok(result);
        }).WithName("CreateMeetingPoll").RequireAuthorization();

        return group;
    }
}
