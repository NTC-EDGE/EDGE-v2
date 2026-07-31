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
using EDGE.Application.SystemConfigs.Commands.UpdateSystemConfig;
using EDGE.Application.SystemConfigs.Queries.GetSystemConfigs;
using EDGE.Application.SystemConfigs.DTOs;

namespace EDGE.Api.Endpoints;

public static class SystemConfigEndpoints
{
    public static RouteGroupBuilder MapSystemConfigEndpoints(this RouteGroupBuilder group)
    {
        var configs = group.MapGroup("system-config")
            .WithTags("System Configuration");

        configs.MapGet("/", GetSystemConfigs)
            .WithName("GetSystemConfigs")
            .WithSummary("Get system configurations")
            .WithDescription("Retrieves all application system configurations or filtered by category.")
            .Produces<List<SystemConfigDto>>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        configs.MapGet("/public", GetPublicSystemConfigs)
            .WithName("GetPublicSystemConfigs")
            .WithSummary("Get public system settings")
            .WithDescription("Retrieves non-sensitive public system settings such as maintenance mode, system title, and logo.")
            .Produces<List<SystemConfigDto>>(StatusCodes.Status200OK);

        configs.MapPut("/", UpdateSystemConfig)
            .WithName("UpdateSystemConfig")
            .WithSummary("Update system configuration setting")
            .WithDescription("Updates value or description for a specific configuration key.")
            .Produces<SystemConfigDto>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetSystemConfigs(string? category, IMediator mediator)
    {
        var result = await mediator.Send(new GetSystemConfigsQuery(category, PublicOnly: false));
        return Results.Ok(result);
    }

    [AllowAnonymous]
    public static async Task<IResult> GetPublicSystemConfigs(IMediator mediator)
    {
        var result = await mediator.Send(new GetSystemConfigsQuery(Category: null, PublicOnly: true));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateSystemConfig(
        UpdateSystemConfigCommand command,
        IValidator<UpdateSystemConfigCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return Results.Ok(result);
    }
}
