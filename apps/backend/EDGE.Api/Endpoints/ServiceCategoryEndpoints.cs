using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.ServiceCategories.Commands.CreateServiceCategory;
using EDGE.Application.ServiceCategories.Commands.UpdateServiceCategory;
using EDGE.Application.ServiceCategories.Commands.DeleteServiceCategory;
using EDGE.Application.ServiceCategories.Queries.GetServiceCategories;
using EDGE.Application.ServiceCategories.Queries.GetServiceCategoryById;
using EDGE.Application.Common.Models;

namespace EDGE.Api.Endpoints;

public static class ServiceCategoryEndpoints
{
    public static IEndpointRouteBuilder MapServiceCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/service-categories").WithTags("ServiceCategories");

        group.MapGet("/", GetServiceCategories)
            .WithName("GetServiceCategories")
            .WithSummary("Get all service categories")
            .WithDescription("Returns all service categories (Certificate, Accreditation, Exam, License, Permit, RequestsAndComplaints).");

        group.MapGet("/{id:guid}", GetServiceCategoryById)
            .WithName("GetServiceCategoryById")
            .WithSummary("Get service category by ID")
            .WithDescription("Fetches a single service category by its unique identifier.");

        group.MapPost("/", CreateServiceCategory)
            .WithName("CreateServiceCategory")
            .WithSummary("Create a new service category")
            .WithDescription("Creates a new service category.");

        group.MapPut("/{id:guid}", UpdateServiceCategory)
            .WithName("UpdateServiceCategory")
            .WithSummary("Update service category")
            .WithDescription("Updates the name, description, or code of a service category.");

        group.MapDelete("/{id:guid}", DeleteServiceCategory)
            .WithName("DeleteServiceCategory")
            .WithSummary("Delete a service category")
            .WithDescription("Fails with 409 Conflict if the category has associated services.");

        return app;
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceCategories(IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceCategoriesQuery());
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadServices)]
    public static async Task<IResult> GetServiceCategoryById(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new GetServiceCategoryByIdQuery(id));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.CreateServices)]
    public static async Task<IResult> CreateServiceCategory(CreateServiceCategoryCommand command, IMediator mediator)
    {
        var result = await mediator.Send(command);
        return result.Succeeded
            ? Results.Created($"/api/v2/service-categories/{result.Data}", result)
            : Results.BadRequest(result);
    }

    [HasPermission(Permissions.UpdateServices)]
    public static async Task<IResult> UpdateServiceCategory(Guid id, UpdateServiceCategoryCommand command, IMediator mediator)
    {
        if (id != command.Id)
            return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));

        var result = await mediator.Send(command);
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.DeleteServices)]
    public static async Task<IResult> DeleteServiceCategory(Guid id, IMediator mediator)
    {
        var result = await mediator.Send(new DeleteServiceCategoryCommand(id));
        if (!result.Succeeded)
        {
            return result.Message != null && result.Message.Contains("not found")
                ? Results.NotFound(result)
                : Results.Conflict(result);
        }
        return Results.Ok(result);
    }
}
