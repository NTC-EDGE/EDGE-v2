using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Application.Receipts.Dtos;
using EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;
using EDGE.Application.Receipts.Commands.Booklets.UpdateOrBooklet;
using EDGE.Application.Receipts.Commands.Booklets.TransferOrBooklet;
using EDGE.Application.Receipts.Commands.Receipts.IssueOfficialReceipt;
using EDGE.Application.Receipts.Commands.Receipts.EditOfficialReceipt;
using EDGE.Application.Receipts.Commands.Receipts.CancelOfficialReceipt;
using EDGE.Application.Receipts.Commands.Deposits.CreateBankDeposit;
using EDGE.Application.Receipts.Commands.BankAccounts.CreateAgencyBankAccount;
using EDGE.Application.Receipts.Commands.BankAccounts.UpdateAgencyBankAccount;
using EDGE.Application.Receipts.Queries.Booklets.GetOrBooklets;
using EDGE.Application.Receipts.Queries.Booklets.GetNextAvailableOrNumber;
using EDGE.Application.Receipts.Queries.Receipts.GetOfficialReceipts;
using EDGE.Application.Receipts.Queries.Receipts.GetOfficialReceiptById;
using EDGE.Application.Receipts.Queries.Receipts.GetUndepositedReceipts;
using EDGE.Application.Receipts.Queries.BankAccounts.GetAgencyBankAccounts;
using EDGE.Application.Receipts.Queries.Deposits.GetBankDeposits;
using EDGE.Application.Receipts.Queries.Deposits.GetBankDepositById;
using EDGE.Application.Receipts.Queries.Reports.GetCashierRcdReport;
using EDGE.Application.Receipts.Queries.Reports.GetCancelledOrReport;
using EDGE.Application.Receipts.Queries.PendingPayments;
using EDGE.Application.Receipts.Queries.Fees.GetReceiptFeeCatalog;

namespace EDGE.Api.Endpoints;

public static class ReceiptEndpoints
{
    public static IEndpointRouteBuilder MapReceiptEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/receipts").WithTags("Receipts & Cashiering");

        // Fee Catalog for Cashier Line Items
        group.MapGet("/fee-catalog", GetReceiptFeeCatalog)
            .WithName("GetReceiptFeeCatalog")
            .WithSummary("Get Receipt Fee Catalog")
            .WithDescription("Retrieves all standard fees from ServiceFees, ServiceVariantFees, ServiceVariantElementFees and Master Fees for cashier fee selection.");

        // Pending Collections / For Payment
        group.MapGet("/pending-payments", GetPendingPayments)
            .WithName("GetPendingPayments")
            .WithSummary("Get Pending Payments")
            .WithDescription("Retrieves applications and orders of payment subject for cashier collection.");

        // Booklets
        group.MapGet("/booklets", GetOrBooklets)
            .WithName("GetOrBooklets")
            .WithSummary("Get OR Booklets")
            .WithDescription("Retrieves Official Receipt booklets for the tenant.");

        group.MapPost("/booklets", CreateOrBooklet)
            .WithName("CreateOrBooklet")
            .WithSummary("Register OR Booklet")
            .WithDescription("Registers a new accountable form OR booklet.");

        group.MapPut("/booklets/{id:guid}", UpdateOrBooklet)
            .WithName("UpdateOrBooklet")
            .WithSummary("Update OR Booklet")
            .WithDescription("Updates an accountable form OR booklet series if no receipts have been issued yet.");

        group.MapPost("/booklets/{id:guid}/transfer", TransferOrBooklet)
            .WithName("TransferOrBooklet")
            .WithSummary("Transfer OR Booklet")
            .WithDescription("Transfers or reassigns an OR booklet to another cashier / staff member.");

        group.MapGet("/booklets/next-available", GetNextAvailableOrNumber)
            .WithName("GetNextAvailableOrNumber")
            .WithSummary("Get Next Available OR Number")
            .WithDescription("Retrieves the next sequential OR number for the active booklet.");

        // Official Receipts
        group.MapGet("/", GetOfficialReceipts)
            .WithName("GetOfficialReceipts")
            .WithSummary("Get Official Receipts")
            .WithDescription("Retrieves issued official receipts with optional filtering.");

        group.MapGet("/undeposited", GetUndepositedReceipts)
            .WithName("GetUndepositedReceipts")
            .WithSummary("Get Undeposited Official Receipts")
            .WithDescription("Retrieves issued official receipts ready for bank deposit.");

        group.MapGet("/{id:guid}", GetOfficialReceiptById)
            .WithName("GetOfficialReceiptById")
            .WithSummary("Get Official Receipt By ID")
            .WithDescription("Retrieves full details of an official receipt.");

        group.MapPost("/", IssueOfficialReceipt)
            .WithName("IssueOfficialReceipt")
            .WithSummary("Issue Official Receipt")
            .WithDescription("Issues a new official receipt and marks order of payment paid.");

        group.MapPut("/{id:guid}", EditOfficialReceipt)
            .WithName("EditOfficialReceipt")
            .WithSummary("Edit Official Receipt")
            .WithDescription("Edits an issued official receipt before deposit.");

        group.MapPost("/{id:guid}/cancel", CancelOfficialReceipt)
            .WithName("CancelOfficialReceipt")
            .WithSummary("Cancel Official Receipt")
            .WithDescription("Cancels an official receipt with reason and reverts payment status.");

        group.MapGet("/{id:guid}/print", PrintOfficialReceiptById)
            .AllowAnonymous()
            .WithName("PrintOfficialReceiptById")
            .WithSummary("Print Official Receipt by ID")
            .WithDescription("Generates and downloads official printable PDF Official Receipt (Accountable Form No. 51).");

        app.MapGet("/applications/{id:guid}/or/print", PrintApplicationOfficialReceipt)
            .AllowAnonymous()
            .WithTags("Receipts")
            .WithName("PrintApplicationOfficialReceipt")
            .WithSummary("Print Application Official Receipt")
            .WithDescription("Generates and downloads official printable PDF Official Receipt (Accountable Form No. 51) for the application.");

        // Bank Accounts
        group.MapGet("/bank-accounts", GetAgencyBankAccounts)
            .WithName("GetAgencyBankAccounts")
            .WithSummary("Get Agency Bank Accounts")
            .WithDescription("Retrieves authorized government depositary bank accounts.");

        group.MapPost("/bank-accounts", CreateAgencyBankAccount)
            .WithName("CreateAgencyBankAccount")
            .WithSummary("Register Agency Bank Account")
            .WithDescription("Registers a new depositary bank account.");

        group.MapPut("/bank-accounts/{id:guid}", UpdateAgencyBankAccount)
            .WithName("UpdateAgencyBankAccount")
            .WithSummary("Update Agency Bank Account")
            .WithDescription("Updates an existing agency bank account.");

        // Deposits
        group.MapGet("/deposits", GetBankDeposits)
            .WithName("GetBankDeposits")
            .WithSummary("Get Bank Deposits")
            .WithDescription("Retrieves bank deposit remittance batches.");

        group.MapGet("/deposits/{id:guid}", GetBankDepositById)
            .WithName("GetBankDepositById")
            .WithSummary("Get Bank Deposit By ID")
            .WithDescription("Retrieves bank deposit remittance batch details.");

        group.MapPost("/deposits", CreateBankDeposit)
            .WithName("CreateBankDeposit")
            .WithSummary("Create Bank Deposit")
            .WithDescription("Creates a new bank deposit batch and marks linked receipts deposited.");

        // Reports
        group.MapGet("/reports/rcd", GetCashierRcdReport)
            .WithName("GetCashierRcdReport")
            .WithSummary("Get Report of Collections and Deposits (RCD)")
            .WithDescription("Generates official cashier RCD summary and details.");

        group.MapGet("/reports/cancelled", GetCancelledOrReport)
            .WithName("GetCancelledOrReport")
            .WithSummary("Get Cancelled OR Report")
            .WithDescription("Generates list of cancelled official receipts with reasons.");

        return app;
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetOrBooklets(
        [FromQuery] Guid? tenantId,
        [FromQuery] BookletStatus? status,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetOrBookletsQuery(tenantId ?? Guid.Empty, status));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsBundleEntry)]
    public static async Task<IResult> CreateOrBooklet(
        [FromBody] CreateOrBookletCommand command,
        IMediator mediator)
    {
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsBundleEntry)]
    public static async Task<IResult> UpdateOrBooklet(
        [FromRoute] Guid id,
        [FromBody] UpdateOrBookletRequest request,
        IMediator mediator)
    {
        var result = await mediator.Send(new UpdateOrBookletCommand(
            id,
            request.TenantId,
            request.BookletNumber,
            request.Prefix,
            request.StartNumber,
            request.EndNumber,
            request.TotalCount,
            request.AssignedUserId,
            request.AssignedUserIds,
            request.Remarks));
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsBundleEntry)]
    public static async Task<IResult> TransferOrBooklet(
        [FromRoute] Guid id,
        [FromBody] TransferOrBookletRequest request,
        IMediator mediator)
    {
        var result = await mediator.Send(new TransferOrBookletCommand(
            id,
            request.TenantId,
            request.NewAssignedUserId,
            request.AdditionalUserIds,
            request.TransferReason));
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetNextAvailableOrNumber(
        [FromQuery] Guid? tenantId,
        [FromQuery] string? cashierUserId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetNextAvailableOrNumberQuery(tenantId ?? Guid.Empty, cashierUserId));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetOfficialReceipts(
        [FromQuery] Guid? tenantId,
        [FromQuery] ReceiptStatus? status,
        [FromQuery] PaymentMethod? paymentMethod,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? cashierUserId,
        [FromQuery] string? search,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetOfficialReceiptsQuery(tenantId ?? Guid.Empty, status, paymentMethod, fromDate, toDate, cashierUserId, search));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsDeposit)]
    public static async Task<IResult> GetUndepositedReceipts(
        [FromQuery] Guid? tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetUndepositedReceiptsQuery(tenantId ?? Guid.Empty));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetOfficialReceiptById(
        Guid id,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetOfficialReceiptByIdQuery(id));
        if (!result.Succeeded) return Results.NotFound(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsIssue)]
    public static async Task<IResult> IssueOfficialReceipt(
        [FromBody] IssueOfficialReceiptCommand command,
        IMediator mediator)
    {
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsEdit)]
    public static async Task<IResult> EditOfficialReceipt(
        Guid id,
        [FromBody] EditOfficialReceiptCommand command,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public record CancelOrBodyRequest(string CancellationReason);

    [HasPermission(Permissions.ReceiptsCancel)]
    public static async Task<IResult> CancelOfficialReceipt(
        Guid id,
        [FromBody] CancelOrBodyRequest body,
        IMediator mediator)
    {
        var command = new CancelOfficialReceiptCommand(id, body.CancellationReason);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public static async Task<IResult> PrintOfficialReceiptById(
        Guid id,
        IOfficialReceiptRepository receiptRepository,
        IApplicationFullRepository appRepository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var receipt = await receiptRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (receipt == null)
        {
            return Results.NotFound(new { message = $"Official Receipt with ID '{id}' was not found." });
        }

        Domain.Entities.Application? app = null;
        if (receipt.ApplicationId.HasValue && receipt.ApplicationId.Value != Guid.Empty)
        {
            app = await appRepository.GetByIdWithDetailsAsync(receipt.ApplicationId.Value, true, cancellationToken);
        }

        var printModel = OfficialReceiptPrintMapper.MapToPrintModel(receipt: receipt, op: receipt.OrderOfPayment, app: app);
        var pdfBytes = printingService.PrintOfficialReceipt(printModel);
        var fileName = $"OR_{receipt.OfficialReceiptNumber ?? id.ToString()}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    public static async Task<IResult> PrintApplicationOfficialReceipt(
        Guid id,
        IApplicationFullRepository appRepository,
        IOfficialReceiptRepository receiptRepository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        bool download = false,
        CancellationToken cancellationToken = default)
    {
        var app = await appRepository.GetByIdWithDetailsAsync(id, true, cancellationToken);
        if (app == null)
        {
            return Results.NotFound(new { message = $"Application with ID '{id}' was not found." });
        }

        var paidOp = app.OrdersOfPayment
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        OfficialReceipt? receipt = null;
        if (paidOp != null && !string.IsNullOrWhiteSpace(paidOp.OfficialReceiptNumber))
        {
            receipt = await receiptRepository.GetByOrNumberAsync(app.TenantId, paidOp.OfficialReceiptNumber, cancellationToken);
        }

        if (receipt == null)
        {
            var receipts = await receiptRepository.GetByTenantAsync(app.TenantId, cancellationToken: cancellationToken);
            receipt = receipts.FirstOrDefault(r => r.ApplicationId == id || (paidOp != null && r.OrderOfPaymentId == paidOp.Id));
        }

        if (paidOp == null && receipt == null)
        {
            return Results.NotFound(new { message = $"No paid Official Receipt found for Application '{id}'. Payment must first be accepted by the Cashier." });
        }

        var printModel = OfficialReceiptPrintMapper.MapToPrintModel(receipt: receipt, op: paidOp, app: app);
        var pdfBytes = printingService.PrintOfficialReceipt(printModel);
        var orNo = receipt?.OfficialReceiptNumber ?? paidOp?.OfficialReceiptNumber ?? app.ReferenceNumber ?? id.ToString();
        var fileName = $"OR_{orNo}.pdf";

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetAgencyBankAccounts(
        [FromQuery] Guid? tenantId,
        [FromQuery] bool? activeOnly,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetAgencyBankAccountsQuery(tenantId ?? Guid.Empty, activeOnly));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.BankAccountsManage)]
    public static async Task<IResult> CreateAgencyBankAccount(
        [FromBody] CreateAgencyBankAccountCommand command,
        IMediator mediator)
    {
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.BankAccountsManage)]
    public static async Task<IResult> UpdateAgencyBankAccount(
        Guid id,
        [FromBody] UpdateAgencyBankAccountCommand command,
        IMediator mediator)
    {
        if (id != command.Id)
        {
            command = command with { Id = id };
        }
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsDeposit)]
    public static async Task<IResult> GetBankDeposits(
        [FromQuery] Guid? tenantId,
        [FromQuery] Guid? bankAccountId,
        [FromQuery] DepositStatus? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetBankDepositsQuery(tenantId ?? Guid.Empty, bankAccountId, status, fromDate, toDate));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsDeposit)]
    public static async Task<IResult> GetBankDepositById(
        Guid id,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetBankDepositByIdQuery(id));
        if (!result.Succeeded) return Results.NotFound(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsDeposit)]
    public static async Task<IResult> CreateBankDeposit(
        [FromBody] CreateBankDepositCommand command,
        IMediator mediator)
    {
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CashierReports)]
    public static async Task<IResult> GetCashierRcdReport(
        [FromQuery] Guid? tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? cashierUserId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetCashierRcdReportQuery(tenantId ?? Guid.Empty, fromDate, toDate, cashierUserId));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetPendingPayments(
        [FromQuery] Guid? tenantId,
        [FromQuery] string? search,
        [FromQuery] string? fieldOffice,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetPendingPaymentsQuery(tenantId ?? Guid.Empty, search, fieldOffice));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CashierReports)]
    public static async Task<IResult> GetCancelledOrReport(
        [FromQuery] Guid? tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetCancelledOrReportQuery(tenantId ?? Guid.Empty, fromDate, toDate));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetReceiptFeeCatalog(
        [FromQuery] string? search,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetReceiptFeeCatalogQuery(search));
        return Results.Ok(result);
    }
}

public record UpdateOrBookletRequest(
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long? EndNumber = null,
    int TotalCount = 50,
    Guid? AssignedUserId = null,
    List<Guid>? AssignedUserIds = null,
    string? Remarks = null
);

public record TransferOrBookletRequest(
    Guid TenantId,
    Guid NewAssignedUserId,
    List<Guid>? AdditionalUserIds = null,
    string? TransferReason = null
);

