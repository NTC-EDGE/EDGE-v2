using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Applications.Commands.GenerateSoa;
using EDGE.Application.Applications.Commands.AddSoaLineItem;
using EDGE.Application.Applications.Commands.UpdateSoaLineItem;
using EDGE.Application.Applications.Commands.DeleteSoaLineItem;
using EDGE.Application.Applications.Commands.UpdateSoa;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

using EDGE.Api.Endpoints.Soas.DTOs;

namespace EDGE.Api.Endpoints;

public static class SoaEndpoints
{
    public static IEndpointRouteBuilder MapSoaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/applications/{id:guid}/soas", CreateSoa)
            .WithTags("StatementOfAccount")
            .WithName("CreateSoa")
            .WithSummary("Create Statement of Account")
            .WithDescription("Generates a manual SOA for the given application.");

        app.MapPost("/applications/{id:guid}/soas/generate", GenerateSoa)
            .WithTags("StatementOfAccount")
            .WithName("GenerateSoa")
            .WithSummary("Generate Statements of Account for all applicants")
            .WithDescription("Automatically generates individual SOAs for all complete applicants in the approved application based on configured fees.");

        var group = app.MapGroup("/soas").WithTags("StatementOfAccount");

        group.MapPut("/{soaId:guid}", UpdateSoa)
            .WithName("UpdateSoa")
            .WithSummary("Update SOA Details")
            .WithDescription("Updates due date, issued to info, or remarks on an SOA.");

        group.MapPost("/{soaId:guid}/line-items", AddSoaLineItem)
            .WithName("AddSoaLineItem")
            .WithSummary("Add Line Item to SOA")
            .WithDescription("Adds a new line item / fee to an existing Statement of Account.");

        group.MapPut("/{soaId:guid}/line-items/{lineItemId:guid}", UpdateSoaLineItem)
            .WithName("UpdateSoaLineItem")
            .WithSummary("Update SOA Line Item")
            .WithDescription("Updates particulars, fee rate, validity, or units for an existing SOA line item.");

        group.MapDelete("/{soaId:guid}/line-items/{lineItemId:guid}", DeleteSoaLineItem)
            .WithName("DeleteSoaLineItem")
            .WithSummary("Delete SOA Line Item")
            .WithDescription("Removes a line item from a Statement of Account and recalculates total.");

        group.MapPatch("/{soaId:guid}/approve", ApproveSoa)
            .WithName("ApproveSoa")
            .WithSummary("Approve SOA")
            .WithDescription("Approves the SOA and generates an Order of Payment.");

        group.MapPatch("/{soaId:guid}/return", ReturnSoa)
            .WithName("ReturnSoa")
            .WithSummary("Return SOA")
            .WithDescription("Returns a pending SOA back to evaluator.");

        return app;
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> CreateSoa(
        Guid id,
        CreateSoaRequest request,
        IValidator<CreateSoaCommand> validator,
        IMediator mediator)
    {
        var command = new CreateSoaCommand(
            id,
            request.ApplicantId,
            request.IssuedToType,
            request.IssuedToName,
            request.IssuedToAddress,
            request.DueDate,
            request.LineItems);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Created($"/api/v2/soas/{result.Data}", result);
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> GenerateSoa(
        Guid id,
        IValidator<GenerateSoaCommand> validator,
        IMediator mediator)
    {
        var command = new GenerateSoaCommand(id);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> UpdateSoa(
        Guid soaId,
        UpdateSoaRequest request,
        IValidator<UpdateSoaCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateSoaCommand(
            soaId,
            request.DueDate,
            request.IssuedToName,
            request.IssuedToAddress,
            request.Remarks);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> AddSoaLineItem(
        Guid soaId,
        AddSoaLineItemRequest request,
        IValidator<AddSoaLineItemCommand> validator,
        IMediator mediator)
    {
        var command = new AddSoaLineItemCommand(
            soaId,
            request.Particular,
            request.ItemCode,
            request.Description,
            request.PeriodOfCoverageStart,
            request.PeriodOfCoverageEnd,
            request.ValidityYears,
            request.NoOfUnits,
            request.FeeRate);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Created($"/api/v2/soas/{soaId}/line-items/{result.Data}", result);
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> UpdateSoaLineItem(
        Guid soaId,
        Guid lineItemId,
        UpdateSoaLineItemRequest request,
        IValidator<UpdateSoaLineItemCommand> validator,
        IMediator mediator)
    {
        var command = new UpdateSoaLineItemCommand(
            soaId,
            lineItemId,
            request.Particular,
            request.ItemCode,
            request.Description,
            request.PeriodOfCoverageStart,
            request.PeriodOfCoverageEnd,
            request.ValidityYears,
            request.NoOfUnits,
            request.FeeRate,
            request.Amount);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CreateBilling)]
    public static async Task<IResult> DeleteSoaLineItem(
        Guid soaId,
        Guid lineItemId,
        IValidator<DeleteSoaLineItemCommand> validator,
        IMediator mediator)
    {
        var command = new DeleteSoaLineItemCommand(soaId, lineItemId);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ApproveSoa)]
    public static async Task<IResult> ApproveSoa(
        Guid soaId,
        ApproveSoaRequest? request,
        IValidator<ApproveSoaCommand> validator,
        IMediator mediator)
    {
        var command = new ApproveSoaCommand(soaId, request?.Remarks);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReturnSoa)]
    public static async Task<IResult> ReturnSoa(
        Guid soaId,
        ReturnSoaRequest request,
        IValidator<ReturnSoaCommand> validator,
        IMediator mediator)
    {
        var command = new ReturnSoaCommand(soaId, request.Remarks);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }
}
