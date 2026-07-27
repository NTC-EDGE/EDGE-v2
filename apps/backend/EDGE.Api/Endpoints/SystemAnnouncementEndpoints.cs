using System;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Announcements.Commands.CreateAnnouncement;
using EDGE.Application.Announcements.Commands.DeleteAnnouncement;
using EDGE.Application.Announcements.Queries.GetAnnouncements;

namespace EDGE.Api.Endpoints;

public static class SystemAnnouncementEndpoints
{
    public static RouteGroupBuilder MapSystemAnnouncementEndpoints(this RouteGroupBuilder group)
    {
        var announcements = group.MapGroup("announcements")
            .WithTags("System Announcements");

        announcements.MapPost("/", CreateAnnouncement)
            .WithName("CreateAnnouncement")
            .WithSummary("Create system announcement")
            .WithDescription("Creates a new system-wide operational banner announcement.");

        announcements.MapGet("/", GetAnnouncements)
            .WithName("GetAnnouncements")
            .WithSummary("Get announcements")
            .WithDescription("Retrieves system announcements.");

        announcements.MapDelete("/{id:guid}", DeleteAnnouncement)
            .WithName("DeleteAnnouncement")
            .WithSummary("Delete announcement")
            .WithDescription("Removes a system announcement.");

        return group;
    }

    public static async Task<IResult> CreateAnnouncement(
        CreateAnnouncementCommand command,
        IValidator<CreateAnnouncementCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/announcements/{result.Id}", result);
    }

    public static async Task<IResult> GetAnnouncements(IMediator mediator)
    {
        var result = await mediator.Send(new GetAnnouncementsQuery());
        return Results.Ok(new { succeeded = true, data = result });
    }

    public static async Task<IResult> DeleteAnnouncement(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteAnnouncementCommand(id));
        return success ? Results.NoContent() : Results.NotFound(new { message = "Announcement not found" });
    }
}
