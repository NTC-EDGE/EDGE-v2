using FluentValidation;
using MediatR;
using EDGE.Application.Announcements.Commands.CreateAnnouncement;
using EDGE.Application.Announcements.Commands.UpdateAnnouncement;
using EDGE.Application.Announcements.Commands.TogglePublishAnnouncement;
using EDGE.Application.Announcements.Commands.DeleteAnnouncement;
using EDGE.Application.Announcements.Queries.GetAnnouncements;
using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

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

        announcements.MapPut("/{id:guid}", UpdateAnnouncement)
            .WithName("UpdateAnnouncement")
            .WithSummary("Update system announcement")
            .WithDescription("Updates an existing system announcement.");

        announcements.MapPatch("/{id:guid}/publish", TogglePublishAnnouncement)
            .WithName("TogglePublishAnnouncement")
            .WithSummary("Publish or unpublish system announcement")
            .WithDescription("Toggles the active publishing state of a system announcement.");

        announcements.MapDelete("/{id:guid}", DeleteAnnouncement)
            .WithName("DeleteAnnouncement")
            .WithSummary("Delete announcement")
            .WithDescription("Removes a system announcement.");

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
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

    [Authorize]
    public static async Task<IResult> GetAnnouncements(IMediator mediator)
    {
        var result = await mediator.Send(new GetAnnouncementsQuery());
        return Results.Ok(new { succeeded = true, data = result });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateAnnouncement(
        Guid id,
        UpdateAnnouncementCommand command,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "ID mismatch." });
        }

        var result = await mediator.Send(command);
        return result != null ? Results.Ok(result) : Results.NotFound(new { message = "Announcement not found." });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> TogglePublishAnnouncement(
        Guid id,
        TogglePublishAnnouncementCommand command,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "ID mismatch." });
        }

        var result = await mediator.Send(command);
        return result != null ? Results.Ok(result) : Results.NotFound(new { message = "Announcement not found." });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteAnnouncement(Guid id, IMediator mediator)
    {
        var success = await mediator.Send(new DeleteAnnouncementCommand(id));
        return success ? Results.NoContent() : Results.NotFound(new { message = "Announcement not found" });
    }
}
