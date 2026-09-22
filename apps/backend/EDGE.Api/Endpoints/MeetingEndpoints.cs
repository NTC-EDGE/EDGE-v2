using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Meetings.Commands.CreateMeeting;
using EDGE.Application.Meetings.Commands.CreateMeetingPoll;
using EDGE.Application.Meetings.Commands.ExecuteMeetingAction;
using EDGE.Application.Meetings.Queries.GetMeetings;
using EDGE.Application.Meetings.Queries.GetMeetingByCode;

namespace EDGE.Api.Endpoints;

public static class MeetingEndpoints
{
    public static RouteGroupBuilder MapMeetingEndpoints(this RouteGroupBuilder group)
    {
        var meet = group.MapGroup("meetings").WithTags("Meetings");

        meet.MapGet("/", async ([FromQuery] Guid? tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMeetingsQuery(tenantId));
            return Results.Ok(result);
        }).WithName("GetMeetings").RequireAuthorization();

        meet.MapGet("/{meetingCode}", async (string meetingCode, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMeetingByCodeQuery(meetingCode));
            return result != null ? Results.Ok(result) : Results.NotFound();
        }).WithName("GetMeetingByCode").RequireAuthorization();

        meet.MapPost("/", async ([FromBody] CreateMeetingCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/meetings/{result.MeetingCode}", result);
        }).WithName("CreateMeeting").RequireAuthorization();

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
