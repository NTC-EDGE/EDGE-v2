using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.NotificationTemplates.Commands.UpdateNotificationTemplate;
using EDGE.Application.NotificationTemplates.Queries.GetNotificationTemplates;
using EDGE.Application.NotificationTemplates.DTOs;

namespace EDGE.Api.Endpoints;

public record UpdateNotificationTemplateRequest(
    string Subject,
    string BodyHtml,
    bool IsActive
);

public static class NotificationTemplateEndpoints
{
    public static RouteGroupBuilder MapNotificationTemplateEndpoints(this RouteGroupBuilder group)
    {
        var templates = group.MapGroup("notification-templates")
            .WithTags("Notification Templates");

        templates.MapGet("/", GetNotificationTemplates)
            .WithName("GetNotificationTemplates")
            .WithSummary("Get email notification templates")
            .WithDescription("Retrieves paginated automated email templates triggered by system events.")
            .Produces<EDGE.Application.Common.Models.PaginatedApiResponse<NotificationTemplateDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        templates.MapPut("/{id:guid}", UpdateNotificationTemplate)
            .WithName("UpdateNotificationTemplate")
            .WithSummary("Update notification template")
            .WithDescription("Updates subject, HTML body, or active state of a notification template.")
            .Produces<NotificationTemplateDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetNotificationTemplates(
        IMediator mediator,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageNumber = 1,
        [Microsoft.AspNetCore.Mvc.FromQuery] int pageSize = 10,
        [Microsoft.AspNetCore.Mvc.FromQuery] string? searchTerm = null)
    {
        var result = await mediator.Send(new GetNotificationTemplatesQuery(pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateNotificationTemplate(
        Guid id,
        UpdateNotificationTemplateRequest request,
        IValidator<UpdateNotificationTemplateCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateNotificationTemplateCommand(id, request.Subject, request.BodyHtml, request.IsActive);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
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
    }
}
