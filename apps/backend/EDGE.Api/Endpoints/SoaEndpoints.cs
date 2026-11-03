using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Services;
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
            .WithDescription("Generates an SOA for the given application.");

        app.MapGet("/applications/{id:guid}/soa/print", PrintApplicationSoa)
            .AllowAnonymous()
            .WithTags("StatementOfAccount")
            .WithName("PrintApplicationSoa")
            .WithSummary("Print Application Statement of Account")
            .WithDescription("Generates and downloads official printable PDF Statement of Account document for the application.");

        var group = app.MapGroup("/soas").WithTags("StatementOfAccount");

        group.MapGet("/{soaId:guid}/print", PrintSoaById)
            .AllowAnonymous()
            .WithName("PrintSoaById")
            .WithSummary("Print Statement of Account by ID")
            .WithDescription("Generates and downloads official printable PDF Statement of Account document by SOA ID.");

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
        CreateSoaRequest? request,
        FluentValidation.IValidator<CreateSoaCommand> validator,
        IMediator mediator)
    {
        var command = new CreateSoaCommand(
            id,
            request?.ApplicantId,
            request?.IssuedToType ?? "Individual",
            request?.IssuedToName ?? string.Empty,
            request?.IssuedToAddress,
            request?.DueDate ?? DateTime.UtcNow.AddDays(30),
            request?.LineItems,
            request?.ValidityYears,
            request?.NoOfUnits,
            request?.ExpirationDate,
            request?.AdditionalServicesCount,
            request?.NoOfCopies,
            request?.Remarks,
            request?.SoaNoteId);

        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Created($"/api/v2/soas/{result.Data}", result);
    }

    [HasPermission(Permissions.ApproveSoa)]
    public static async Task<IResult> ApproveSoa(
        Guid soaId,
        ApproveSoaRequest? request,
        FluentValidation.IValidator<ApproveSoaCommand> validator,
        IMediator mediator)
    {
        var command = new ApproveSoaCommand(
            SoaId: soaId,
            Remarks: request?.Remarks,
            ApplicationId: request?.ApplicationId);
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
        FluentValidation.IValidator<ReturnSoaCommand> validator,
        IMediator mediator)
    {
        var command = new ReturnSoaCommand(
            SoaId: soaId,
            Remarks: request?.Remarks ?? string.Empty,
            ApplicationId: request?.ApplicationId);
        var validationResult = await validator.ValidateAsync(command);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public static async Task<IResult> PrintApplicationSoa(
        Guid id,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        IOfficialReceiptRepository? receiptRepository = null,
        string? orNumber = null,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var app = await repository.GetByIdWithDetailsAsync(id, true, cancellationToken);
        if (app == null)
        {
            return Results.NotFound(new { message = $"Application with ID '{id}' was not found." });
        }

        var soa = app.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault();

        // Prioritize paid Order of Payment if one exists
        var paidOp = app.OrdersOfPayment
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        var op = paidOp ?? app.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        // If no direct SOA found on application, check if linked via Order of Payment
        if (soa == null && op != null && op.StatementOfAccountId != Guid.Empty)
        {
            soa = await repository.GetSoaByIdAsync(op.StatementOfAccountId, cancellationToken);
        }

        // If still no SOA but OP exists or Application exists, use OP / Application as reference
        if (soa == null && op == null && (app.ApplicationApplicants == null || !app.ApplicationApplicants.Any()) && app.User == null && string.IsNullOrWhiteSpace(app.ReferenceNumber))
        {
            return Results.NotFound(new { message = $"No Statement of Account or Order of Payment found for Application '{id}'." });
        }

        OfficialReceipt? receipt = null;
        if (receiptRepository != null)
        {
            if (!string.IsNullOrWhiteSpace(orNumber))
            {
                var cleanOr = orNumber.TrimStart('#').Trim();
                receipt = await receiptRepository.GetByOrNumberAsync(app.TenantId, cleanOr, cancellationToken)
                          ?? await receiptRepository.GetByOrNumberAsync(app.TenantId, orNumber.Trim(), cancellationToken);
            }

            if (receipt == null && op != null)
            {
                var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
                receipt = opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
            }

            if (receipt == null)
            {
                var receipts = await receiptRepository.GetByTenantAsync(app.TenantId, cancellationToken: cancellationToken);
                receipt = receipts.OrderByDescending(r => r.IssuedAt)
                    .FirstOrDefault(r => r.ApplicationId == app.Id || (op != null && r.OrderOfPaymentId == op.Id));
            }
        }

        var regionalSignatories = await repository.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, cancellationToken);
        var printModel = StatementOfAccountPrintMapper.MapToPrintModel(
            soa: soa,
            app: app,
            op: op,
            regionalSignatories: regionalSignatories,
            receipt: receipt,
            overrideOrNumber: orNumber);
        var pdfBytes = printingService.PrintStatementOfAccount(printModel);
        var fileName = $"SOA_{printModel.AccountNo ?? id.ToString()}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    public static async Task<IResult> PrintSoaById(
        Guid soaId,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        IOfficialReceiptRepository? receiptRepository = null,
        string? orNumber = null,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var soa = await repository.GetSoaByIdAsync(soaId, cancellationToken);
        if (soa == null)
        {
            return Results.NotFound(new { message = $"Statement of Account with ID '{soaId}' was not found." });
        }

        var app = soa.Application ?? await repository.GetByIdWithDetailsAsync(soa.ApplicationId, true, cancellationToken);
        var tenantId = app?.TenantId ?? Guid.Empty;

        var paidOp = app?.OrdersOfPayment?
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        var op = paidOp
            ?? app?.OrdersOfPayment.FirstOrDefault(o => o.StatementOfAccountId == soa.Id)
            ?? app?.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

        OfficialReceipt? receipt = null;
        if (receiptRepository != null && tenantId != Guid.Empty)
        {
            if (!string.IsNullOrWhiteSpace(orNumber))
            {
                var cleanOr = orNumber.TrimStart('#').Trim();
                receipt = await receiptRepository.GetByOrNumberAsync(tenantId, cleanOr, cancellationToken)
                          ?? await receiptRepository.GetByOrNumberAsync(tenantId, orNumber.Trim(), cancellationToken);
            }

            if (receipt == null && op != null)
            {
                var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
                receipt = opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
            }

            if (receipt == null && app != null)
            {
                var receipts = await receiptRepository.GetByTenantAsync(tenantId, cancellationToken: cancellationToken);
                receipt = receipts.OrderByDescending(r => r.IssuedAt)
                    .FirstOrDefault(r => r.ApplicationId == app.Id || (op != null && r.OrderOfPaymentId == op.Id));
            }
        }

        var regionalSignatories = await repository.GetRegionalSignatoriesAsync(app?.TenantId, app?.RegionId, cancellationToken);
        var printModel = StatementOfAccountPrintMapper.MapToPrintModel(
            soa: soa,
            app: app,
            op: op,
            regionalSignatories: regionalSignatories,
            receipt: receipt,
            overrideOrNumber: orNumber);
        var pdfBytes = printingService.PrintStatementOfAccount(printModel);
        var fileName = $"SOA_{printModel.AccountNo ?? soaId.ToString()}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }
}
