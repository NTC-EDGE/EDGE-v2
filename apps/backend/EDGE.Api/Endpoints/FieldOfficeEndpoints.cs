using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.FieldOffices.DTOs;
using EDGE.Application.FieldOffices.Commands.CreateFieldOffice;
using EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;
using EDGE.Application.FieldOffices.Commands.DeleteFieldOffice;
using EDGE.Application.FieldOffices.Queries.GetFieldOffices;
using EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;
using EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

namespace EDGE.Api.Endpoints;

public static class FieldOfficeEndpoints
{
    public static RouteGroupBuilder MapFieldOfficeEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/tenants/{tenantId:guid}/field-offices", GetFieldOfficesByTenant)
            .WithName("GetFieldOfficesByTenant")
            .WithTags("FieldOffices")
            .WithSummary("Get field offices by tenant organization")
            .WithDescription("Returns all field offices associated with the tenant organization's region.")
            .RequireAuthorization();

        var offices = group.MapGroup("field-offices")
            .WithTags("FieldOffices");

        offices.MapGet("/", GetFieldOffices)
            .WithName("GetFieldOffices")
            .WithTags("FieldOffices")
            .WithSummary("Retrieve all field offices")
            .WithDescription("Retrieves a list of all field offices for a specific tenant.")
            .RequireAuthorization();

        offices.MapGet("/{id:guid}", GetFieldOfficeById)
            .WithName("GetFieldOfficeById")
            .WithTags("FieldOffices")
            .WithSummary("Retrieve field office by ID")
            .WithDescription("Retrieves the details of a specific field office by its unique ID and tenant ID.")
            .RequireAuthorization();

        offices.MapPost("/", CreateFieldOffice)
            .WithName("CreateFieldOffice")
            .WithTags("FieldOffices")
            .WithSummary("Create new field office")
            .WithDescription("Creates a new field office record associated with a tenant and region.")
            .RequireAuthorization();

        offices.MapPut("/{id:guid}", UpdateFieldOffice)
            .WithName("UpdateFieldOffice")
            .WithTags("FieldOffices")
            .WithSummary("Update field office details")
            .WithDescription("Updates the details of a specific field office.")
            .RequireAuthorization();

        offices.MapDelete("/{id:guid}", DeleteFieldOffice)
            .WithName("DeleteFieldOffice")
            .WithTags("FieldOffices")
            .WithSummary("Delete a field office")
            .WithDescription("Deletes a field office record by its unique ID and tenant ID.")
            .RequireAuthorization();

        return group;
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetFieldOfficesByTenant(
        Guid tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetFieldOfficesByTenantQuery(tenantId));
        return result.Succeeded ? Results.Ok(result) : Results.NotFound(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetFieldOffices(
        Guid? tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetFieldOfficesQuery(tenantId.GetValueOrDefault()));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReadTenants)]
    public static async Task<IResult> GetFieldOfficeById(
        Guid id,
        Guid? tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetFieldOfficeByIdQuery(id, tenantId.GetValueOrDefault()));
        return result is not null
            ? Results.Ok(result)
            : Results.NotFound(new { message = $"Field office with ID '{id}' was not found for this tenant." });
    }

    [HasPermission(Permissions.CreateTenants)]
    public static async Task<IResult> CreateFieldOffice(
        [FromBody] CreateFieldOfficeRequest request,
        IMediator mediator)
    {
        var command = new CreateFieldOfficeCommand(
            request.GetTenantGuid(),
            request.Name,
            request.Code,
            request.Category,
            request.Description,
            request.GetRegionGuid(),
            request.GetProvinceGuid(),
            request.Address,
            request.ContactPhone,
            request.ContactEmail,
            request.GetOfficerInChargeGuid(),
            request.IsActive,
            request.AllowSpectrumInspection,
            request.AllowPermitIssuance,
            request.AllowComplaintReception
        );

        var result = await mediator.Send(command);
        return Results.Created($"/api/v2/field-offices/{result.Id}", result);
    }

    [HasPermission(Permissions.UpdateTenants)]
    public static async Task<IResult> UpdateFieldOffice(
        Guid id,
        [FromBody] UpdateFieldOfficeRequest request,
        IMediator mediator)
    {
        var command = new UpdateFieldOfficeCommand(
            id,
            request.GetTenantGuid(),
            request.Name,
            request.Code,
            request.Category,
            request.Description,
            request.GetRegionGuid(),
            request.GetProvinceGuid(),
            request.Address,
            request.ContactPhone,
            request.ContactEmail,
            request.GetOfficerInChargeGuid(),
            request.IsActive,
            request.AllowSpectrumInspection,
            request.AllowPermitIssuance,
            request.AllowComplaintReception
        );

        var result = await mediator.Send(command);
        return result is not null
            ? Results.Ok(result)
            : Results.NotFound(new { message = $"Field office with ID '{id}' was not found for this tenant." });
    }

    [HasPermission(Permissions.DeleteTenants)]
    public static async Task<IResult> DeleteFieldOffice(
        Guid id,
        Guid? tenantId,
        IMediator mediator)
    {
        var success = await mediator.Send(new DeleteFieldOfficeCommand(id, tenantId.GetValueOrDefault()));
        return success
            ? Results.NoContent()
            : Results.NotFound(new { message = $"Field office with ID '{id}' was not found or could not be deleted." });
    }
}
