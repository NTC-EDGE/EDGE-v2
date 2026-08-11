using MediatR;
using FluentValidation;
using EDGE.Application.ServiceVariants.Commands.CreateServiceVariant;
using EDGE.Application.ServiceVariants.Commands.UpdateServiceVariant;
using EDGE.Application.ServiceVariants.Commands.DeleteServiceVariant;
using EDGE.Application.ServiceVariants.Queries.GetServiceVariantById;
using EDGE.Application.Services.Queries.GetServiceVariants;
using EDGE.Application.Services.Dtos;
using EDGE.Application.Common.Models;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

namespace EDGE.Api.Endpoints;

public record CreateServiceVariantRequest(Guid ServiceId, string Type, string? Description);
public record UpdateServiceVariantRequest(Guid ServiceId, string Type, string? Description);

public static class ServiceVariantEndpoints
{
    public static RouteGroupBuilder MapServiceVariantEndpoints(this RouteGroupBuilder group)
    {
        var variants = group.MapGroup("service-variants")
            .WithTags("Service Variants");

        variants.MapGet("/", GetServiceVariants)
            .WithName("GetAllServiceVariants")
            .WithSummary("Get all service variants")
            .WithDescription("Retrieves a list of service variants, optionally filtered by ServiceId.")
            .Produces<PaginatedApiResponse<ServiceVariantDto>>(StatusCodes.Status200OK);

        variants.MapGet("/{id:guid}", GetServiceVariantById)
            .WithName("GetServiceVariantById")
            .WithSummary("Get service variant by ID")
            .WithDescription("Retrieves details of a specific service variant by its ID.")
            .Produces<ApiResponse<ServiceVariantDto>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<ServiceVariantDto>>(StatusCodes.Status404NotFound);

        variants.MapPost("/", CreateServiceVariant)
            .WithName("CreateServiceVariant")
            .WithSummary("Create a new service variant")
            .WithDescription("Creates a new service variant record.")
            .Produces<ApiResponse<Guid>>(StatusCodes.Status201Created)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest);

        variants.MapPut("/{id:guid}", UpdateServiceVariant)
            .WithName("UpdateServiceVariant")
            .WithSummary("Update an existing service variant")
            .WithDescription("Updates an existing service variant record.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces<HttpValidationProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<bool>>(StatusCodes.Status404NotFound);

        variants.MapDelete("/{id:guid}", DeleteServiceVariant)
            .WithName("DeleteServiceVariant")
            .WithSummary("Delete a service variant")
            .WithDescription("Deletes a service variant record.")
            .Produces<ApiResponse<bool>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<bool>>(StatusCodes.Status404NotFound);

        return group;
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetServiceVariantById(
        Guid id,
        IValidator<GetServiceVariantByIdQuery> validator,
        IMediator mediator)
    {
        var query = new GetServiceVariantByIdQuery(id);
        var validationResult = await validator.ValidateAsync(query);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> CreateServiceVariant(
        CreateServiceVariantRequest request,
        IValidator<CreateServiceVariantCommand> validator,
        IMediator mediator)
    {
        var command = new CreateServiceVariantCommand
        {
            ServiceId = request.ServiceId,
            Type = request.Type,
            Description = request.Description
        };

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded 
            ? Results.Created($"/api/v2/service-variants/{result.Data}", result) 
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> UpdateServiceVariant(
        Guid id,
        UpdateServiceVariantRequest request,
        IValidator<UpdateServiceVariantCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateServiceVariantCommand
        {
            Id = id,
            ServiceId = request.ServiceId,
            Type = request.Type,
            Description = request.Description
        };

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> DeleteServiceVariant(
        Guid id,
        IValidator<DeleteServiceVariantCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteServiceVariantCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.SystemAdmin)]
    public static async Task<IResult> GetServiceVariants(
        Guid? serviceId,
        int? pageNumber,
        int? pageSize,
        string? searchTerm,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceVariantsQuery(serviceId, pageNumber, pageSize, searchTerm));
        return Results.Ok(result);
    }
}
