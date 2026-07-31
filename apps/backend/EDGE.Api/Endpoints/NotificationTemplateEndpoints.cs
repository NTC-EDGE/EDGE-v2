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

namespace EDGE.Api.Endpoints;

public static class NotificationTemplateEndpoints
{
    public static RouteGroupBuilder MapNotificationTemplateEndpoints(this RouteGroupBuilder group)
    {
        var templates = group.MapGroup("notification-templates")
            .WithTags("Notification Templates");

        templates.MapGet("/", GetNotificationTemplates)
            .WithName("GetNotificationTemplates")
            .WithSummary("Get email notification templates")
            .WithDescription("Retrieves automated email templates triggered by system events.");

        templates.MapPut("/{id:guid}", UpdateNotificationTemplate)
            .WithName("UpdateNotificationTemplate")
            .WithSummary("Update notification template")
            .WithDescription("Updates subject, HTML body, or active state of a notification template.");

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetNotificationTemplates(IMediator mediator)
    {
        var result = await mediator.Send(new GetNotificationTemplatesQuery());
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateNotificationTemplate(
        Guid id,
        UpdateNotificationTemplateCommand command,
        IValidator<UpdateNotificationTemplateCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(new { message = "Path ID does not match request body ID." });
        }

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
