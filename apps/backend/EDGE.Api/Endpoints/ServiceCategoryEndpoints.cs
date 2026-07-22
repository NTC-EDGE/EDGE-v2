using System;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
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

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceCategoriesQuery());
            return Results.Ok(result);
        })
        .WithName("GetServiceCategories")
        .WithSummary("Get all service categories")
        .WithDescription("Returns all service categories (Certificate, Accreditation, Exam, License, Permit, RequestsAndComplaints).");

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetServiceCategoryByIdQuery(id));
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("GetServiceCategoryById")
        .WithSummary("Get service category by ID");

        group.MapPost("/", async (CreateServiceCategoryCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.Succeeded
                ? Results.Created($"/api/v2/service-categories/{result.Data}", result)
                : Results.BadRequest(result);
        })
        .WithName("CreateServiceCategory")
        .WithSummary("Create a new service category");

        group.MapPut("/{id:guid}", async (Guid id, UpdateServiceCategoryCommand command, IMediator mediator) =>
        {
            if (id != command.Id)
                return Results.BadRequest(ApiResponse<Guid>.Fail("ID path parameter does not match command body ID."));

            var result = await mediator.Send(command);
            return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithName("UpdateServiceCategory")
        .WithSummary("Update service category");

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DeleteServiceCategoryCommand(id));
            if (!result.Succeeded)
            {
                return result.Message != null && result.Message.Contains("not found")
                    ? Results.NotFound(result)
                    : Results.Conflict(result);
            }
            return Results.Ok(result);
        })
        .WithName("DeleteServiceCategory")
        .WithSummary("Delete a service category")
        .WithDescription("Fails with 409 Conflict if the category has associated services.");

        return app;
    }
}
