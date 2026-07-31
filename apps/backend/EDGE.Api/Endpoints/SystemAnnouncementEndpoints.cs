using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Authorization;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Announcements.Commands.CreateAnnouncement;
using EDGE.Application.Announcements.Commands.UpdateAnnouncement;
using EDGE.Application.Announcements.Commands.TogglePublishAnnouncement;
using EDGE.Application.Announcements.Commands.DeleteAnnouncement;
using EDGE.Application.Announcements.Queries.GetAnnouncements;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Api.Endpoints;

public record UpdateAnnouncementRequest(
    string Title,
    string Message,
    string Type,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate,
    string TargetAudience
);

public record TogglePublishAnnouncementRequest(
    bool IsActive
);

public static class SystemAnnouncementEndpoints
{
    public static RouteGroupBuilder MapSystemAnnouncementEndpoints(this RouteGroupBuilder group)
    {
        var announcements = group.MapGroup("announcements")
            .WithTags("System Announcements");

        announcements.MapPost("/", CreateAnnouncement)
            .WithName("CreateAnnouncement")
            .WithSummary("Create system announcement")
            .WithDescription("Creates a new system-wide operational banner announcement.")
            .Produces<SystemAnnouncementDto>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        announcements.MapGet("/", GetAnnouncements)
            .WithName("GetAnnouncements")
            .WithSummary("Get announcements")
            .WithDescription("Retrieves system announcements.")
            .Produces<List<SystemAnnouncementDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);

        announcements.MapPut("/{id:guid}", UpdateAnnouncement)
            .WithName("UpdateAnnouncement")
            .WithSummary("Update system announcement")
            .WithDescription("Updates an existing system announcement.")
            .Produces<SystemAnnouncementDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        announcements.MapPatch("/{id:guid}/publish", TogglePublishAnnouncement)
            .WithName("TogglePublishAnnouncement")
            .WithSummary("Publish or unpublish system announcement")
            .WithDescription("Toggles the active publishing state of a system announcement.")
            .Produces<SystemAnnouncementDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        announcements.MapDelete("/{id:guid}", DeleteAnnouncement)
            .WithName("DeleteAnnouncement")
            .WithSummary("Delete announcement")
            .WithDescription("Removes a system announcement.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

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
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateAnnouncement(
        Guid id,
        UpdateAnnouncementRequest request,
        IValidator<UpdateAnnouncementCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateAnnouncementCommand(
            id,
            request.Title,
            request.Message,
            request.Type,
            request.IsActive,
            request.StartDate,
            request.EndDate,
            request.TargetAudience);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result != null ? Results.Ok(result) : Results.NotFound(new { message = "Announcement not found." });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> TogglePublishAnnouncement(
        Guid id,
        TogglePublishAnnouncementRequest request,
        IValidator<TogglePublishAnnouncementCommand> validator,
        IMediator mediator)
    {
        var command = new TogglePublishAnnouncementCommand(id, request.IsActive);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result != null ? Results.Ok(result) : Results.NotFound(new { message = "Announcement not found." });
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteAnnouncement(
        Guid id,
        IValidator<DeleteAnnouncementCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteAnnouncementCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var success = await mediator.Send(command);
        return success ? Results.NoContent() : Results.NotFound(new { message = "Announcement not found" });
    }
}
