using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using EDGE.Domain.Authorization;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Application.Receipts.Dtos;
using EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;
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

namespace EDGE.Api.Endpoints;

public static class ReceiptEndpoints
{
    public static IEndpointRouteBuilder MapReceiptEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/receipts").WithTags("Receipts & Cashiering");

        // Booklets
        group.MapGet("/booklets", GetOrBooklets)
            .WithName("GetOrBooklets")
            .WithSummary("Get OR Booklets")
            .WithDescription("Retrieves Official Receipt booklets for the tenant.");

        group.MapPost("/booklets", CreateOrBooklet)
            .WithName("CreateOrBooklet")
            .WithSummary("Register OR Booklet")
            .WithDescription("Registers a new accountable form OR booklet.");

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
        [FromQuery] Guid tenantId,
        [FromQuery] BookletStatus? status,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetOrBookletsQuery(tenantId, status));
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

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetNextAvailableOrNumber(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? cashierUserId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetNextAvailableOrNumberQuery(tenantId, cashierUserId));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsRead)]
    public static async Task<IResult> GetOfficialReceipts(
        [FromQuery] Guid tenantId,
        [FromQuery] ReceiptStatus? status,
        [FromQuery] PaymentMethod? paymentMethod,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? cashierUserId,
        [FromQuery] string? search,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetOfficialReceiptsQuery(tenantId, status, paymentMethod, fromDate, toDate, cashierUserId, search));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReceiptsDeposit)]
    public static async Task<IResult> GetUndepositedReceipts(
        [FromQuery] Guid tenantId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetUndepositedReceiptsQuery(tenantId));
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

    [HasPermission(Permissions.BankAccountsManage)]
    public static async Task<IResult> GetAgencyBankAccounts(
        [FromQuery] Guid tenantId,
        [FromQuery] bool? activeOnly,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetAgencyBankAccountsQuery(tenantId, activeOnly));
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
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? bankAccountId,
        [FromQuery] DepositStatus? status,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetBankDepositsQuery(tenantId, bankAccountId, status, fromDate, toDate));
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
        [FromQuery] Guid tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] Guid? cashierUserId,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetCashierRcdReportQuery(tenantId, fromDate, toDate, cashierUserId));
        return Results.Ok(result);
    }

    [HasPermission(Permissions.CashierReports)]
    public static async Task<IResult> GetCancelledOrReport(
        [FromQuery] Guid tenantId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        IMediator mediator)
    {
        var result = await mediator.Send(new GetCancelledOrReportQuery(tenantId, fromDate, toDate));
        return Results.Ok(result);
    }
}
