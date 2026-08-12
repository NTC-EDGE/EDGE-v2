using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceInformations.Dtos;
using EDGE.Application.ServiceInformations.Queries.GetServiceInformations;
using EDGE.Application.ServiceInformations.Queries.GetServiceInformationById;
using EDGE.Application.ServiceInformations.Commands.CreateServiceInformation;
using EDGE.Application.ServiceInformations.Commands.UpdateServiceInformation;
using EDGE.Application.ServiceInformations.Commands.DeleteServiceInformation;

namespace EDGE.Api.Endpoints;

public static class ServiceInformationEndpoints
{
    public static RouteGroupBuilder MapServiceInformationEndpoints(this RouteGroupBuilder app)
    {
        var group = app.MapGroup("service-informations").WithTags("ServiceInformations");

        group.MapGet("/", GetServiceInformations)
            .WithName("GetServiceInformations")
            .WithSummary("Get paginated service information entries")
            .WithDescription("Returns paginated official NTC service information entries with search, serviceId, pageNumber, and pageSize query filters.")
            .Produces<PaginatedApiResponse<ServiceInformationDto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetServiceInformationById)
            .WithName("GetServiceInformationById")
            .WithSummary("Get service information by ID")
            .Produces<ApiResponse<ServiceInformationDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<ServiceInformationDto>>(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateServiceInformation)
            .WithName("CreateServiceInformation")
            .WithSummary("Create a new service information entry")
            .Produces<ApiResponse<Guid>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<Guid>>(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateServiceInformation)
            .WithName("UpdateServiceInformation")
            .WithSummary("Update service information entry")
            .Produces<ApiResponse<Guid>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<Guid>>(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteServiceInformation)
            .WithName("DeleteServiceInformation")
            .WithSummary("Delete a service information entry")
            .Produces<ApiResponse<Guid>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<Guid>>(StatusCodes.Status404NotFound);

        return app;
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceInformations(
        string? search,
        Guid? serviceId,
        int? pageNumber,
        int? pageSize,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceInformationsQuery(
            search,
            serviceId,
            pageNumber ?? 1,
            pageSize ?? 10
        ));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceInformationById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceInformationByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.CreateServices)]
    public static async Task<IResult> CreateServiceInformation(
        CreateServiceInformationCommand command,
        IValidator<CreateServiceInformationCommand> validator,
        IMediator mediator)
    {
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded
            ? Results.Created($"/api/v2/service-informations/{result.Data}", result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateServices)]
    public static async Task<IResult> UpdateServiceInformation(
        Guid id,
        UpdateServiceInformationCommand command,
        IValidator<UpdateServiceInformationCommand> validator,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            return Results.BadRequest(ApiResponse<Guid>.Fail("Path ID does not match command ID."));
        }

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded)
        {
            return result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)
                ? Results.NotFound(result)
                : Results.BadRequest(result);
        }
        return Results.Ok(result);
    }

    [HasPermission(Permissions.DeleteServices)]
    public static async Task<IResult> DeleteServiceInformation(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new DeleteServiceInformationCommand(id));
        if (!result.Succeeded)
        {
            return result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase)
                ? Results.NotFound(result)
                : Results.BadRequest(result);
        }
        return Results.Ok(result);
    }
}
