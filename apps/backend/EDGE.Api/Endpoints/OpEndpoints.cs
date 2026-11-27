using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using EDGE.Application.Applications.Commands.VerifyPayment;
using EDGE.Application.Applications.Commands.ReturnOp;
using EDGE.Application.Applications.Commands.UpdateOpNumber;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Storage.Queries.GetFileDownload;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.AcroForm;
using EDGE.Api.Endpoints.Ops.DTOs;

namespace EDGE.Api.Endpoints;

public static class OpEndpoints
{
    public static IEndpointRouteBuilder MapOpEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/applications/{id:guid}/op/print", PrintApplicationOp)
            .AllowAnonymous()
            .WithTags("OrderOfPayment")
            .WithName("PrintApplicationOp")
            .WithSummary("Print Application Order of Payment")
            .WithDescription("Generates and downloads official printable PDF Order of Payment document for the application.");

        var group = app.MapGroup("/ops").WithTags("OrderOfPayment");

        group.MapGet("/{opId:guid}/print", PrintOpById)
            .AllowAnonymous()
            .WithName("PrintOpById")
            .WithSummary("Print Order of Payment by ID")
            .WithDescription("Generates and downloads official printable PDF Order of Payment document by OP ID.");

        group.MapPatch("/{opId:guid}/verify-payment", VerifyPayment)
            .WithName("VerifyPayment")
            .WithSummary("Verify OP Payment")
            .WithDescription("Marks Order of Payment as Paid and completes application.");

        group.MapPatch("/{opId:guid}/return", ReturnOp)
            .WithName("ReturnOp")
            .WithSummary("Return OP")
            .WithDescription("Returns an Order of Payment.");

        group.MapPatch("/{opId:guid}/number", UpdateOpNumber)
            .WithName("UpdateOpNumber")
            .WithSummary("Update Order of Payment (OP) Number")
            .WithDescription("Allows updating the OP number when manual OP numbering is enabled for the regional office.");

        return app;
    }

    [HasPermission(Permissions.ApproveSoa)]
    public static async Task<IResult> UpdateOpNumber(
        Guid opId,
        UpdateOpNumberRequest request,
        FluentValidation.IValidator<UpdateOpNumberCommand> validator,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new UpdateOpNumberCommand(
            OpId: opId,
            OpNumber: request?.OpNumber ?? string.Empty,
            Remarks: request?.Remarks,
            ApplicationId: request?.ApplicationId,
            StatementOfAccountId: request?.StatementOfAccountId);

        var validationResult = await validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
    }

    [HasPermission(Permissions.CollectPayment)]
    public static async Task<IResult> VerifyPayment(Guid opId, VerifyPaymentRequest request, IMediator mediator)
    {
        var command = new VerifyPaymentCommand(opId, request.OfficialReceiptNumber, request.AmountReceived);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    [HasPermission(Permissions.ReturnOp)]
    public static async Task<IResult> ReturnOp(Guid opId, ReturnOpRequest request, IMediator mediator)
    {
        var command = new ReturnOpCommand(opId, request.Remarks, request.ReturnTo);
        var result = await mediator.Send(command);
        if (!result.Succeeded) return Results.BadRequest(result);
        return Results.Ok(result);
    }

    public static async Task<IResult> PrintApplicationOp(
        Guid id,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        IRegionalConfigurationService? configService = null,
        INumberingSeriesService? numberingSeriesService = null,
        IAgencyBankAccountRepository? bankAccountRepository = null,
        IOfficialReceiptRepository? receiptRepository = null,
        string? orNumber = null,
        Guid? opId = null,
        Guid? soaId = null,
        Guid? applicantId = null,
        [FromQuery] bool? download = null,
        CancellationToken cancellationToken = default)
    {
        var app = await repository.GetByIdWithDetailsAsync(id, true, cancellationToken);
        if (app == null)
        {
            return Results.NotFound(new { message = $"Application with ID '{id}' was not found." });
        }

        var activeSoas = (app.StatementsOfAccount ?? Enumerable.Empty<StatementOfAccount>())
            .Where(s => !s.IsDeleted)
            .OrderByDescending(s => s.CreatedAt)
            .ToList();
        var activeOps = (app.OrdersOfPayment ?? Enumerable.Empty<OrderOfPayment>())
            .Where(o => !o.IsDeleted)
            .ToList();
        OrderOfPayment? op = null;
        StatementOfAccount? soa = null;

        if (opId.HasValue && opId.Value != Guid.Empty)
        {
            op = activeOps.FirstOrDefault(o => o.Id == opId.Value);
            soa = op != null ? activeSoas.FirstOrDefault(s => s.Id == op.StatementOfAccountId) : null;
        }
        else if (soaId.HasValue && soaId.Value != Guid.Empty)
        {
            soa = activeSoas.FirstOrDefault(s => s.Id == soaId.Value);
            op = activeOps.OrderByDescending(o => o.PaidAt ?? o.CreatedAt).FirstOrDefault(o => o.StatementOfAccountId == soaId.Value);
        }
        else if (applicantId.HasValue && applicantId.Value != Guid.Empty)
        {
            soa = activeSoas.FirstOrDefault(s => s.ApplicantId == applicantId.Value);
            if (soa != null)
            {
                op = activeOps.OrderByDescending(o => o.PaidAt ?? o.CreatedAt).FirstOrDefault(o => o.StatementOfAccountId == soa.Id);
            }
        }
        else
        {
            var paidOp = activeOps
                .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
                .FirstOrDefault(o => o.Status == OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

            op = paidOp ?? activeOps.OrderByDescending(o => o.CreatedAt).FirstOrDefault();
            soa = op != null
                ? (activeSoas.FirstOrDefault(s => s.Id == op.StatementOfAccountId) ?? activeSoas.FirstOrDefault())
                : activeSoas.FirstOrDefault();
        }

        RegionalConfigurationDto? regionalConfig = null;
        if (configService != null && app.TenantId != Guid.Empty)
        {
            try
            {
                regionalConfig = await configService.GetConfigurationAsync(app.TenantId, cancellationToken);
            }
            catch
            {
                // Fallback to default regional configuration when lookup fails
            }
        }
        var allowManualOpNumber = regionalConfig?.AllowManualOpNumber == true;
        var isOpApproved = app.Status == ApplicationStatus.PendingPayment ||
                           app.Status == ApplicationStatus.ForIssuance ||
                           app.Status == ApplicationStatus.Completed ||
                           app.Status == ApplicationStatus.Approved ||
                           soa?.Status == SoaStatus.Approved ||
                           op?.Status == OpStatus.Paid ||
                           op?.Status == OpStatus.Processing ||
                           !string.IsNullOrWhiteSpace(op?.OfficialReceiptNumber);

        if (op == null)
        {
            if (soa != null || app.Status == ApplicationStatus.ForAccountant)
            {
                var resolvedPreviewOpNumber = "PENDING APPROVAL";
                if (allowManualOpNumber)
                {
                    resolvedPreviewOpNumber = numberingSeriesService != null
                        ? await numberingSeriesService.PreviewNextOpNumberAsync(app.TenantId, cancellationToken)
                        : $"{(regionalConfig?.RcCodeOp ?? "61")}-{DateTime.UtcNow:yyyy-MM}-0001";
                }

                op = new OrderOfPayment
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    StatementOfAccountId = soa?.Id ?? Guid.Empty,
                    OpNumber = resolvedPreviewOpNumber,
                    AmountDue = soa?.TotalAmount ?? 0,
                    Status = OpStatus.Billed,
                    CreatedAt = DateTime.UtcNow
                };
            }
            else
            {
                return Results.NotFound(new { message = $"No Order of Payment found for Application '{id}'." });
            }
        }
        else if (!allowManualOpNumber && !isOpApproved)
        {
            // When OP numbering is set to Auto in Regional Settings, OP number is only assigned after the OP is approved by the Accountant.
            op = new OrderOfPayment
            {
                Id = op.Id,
                ApplicationId = op.ApplicationId,
                StatementOfAccountId = op.StatementOfAccountId,
                OpNumber = "PENDING APPROVAL",
                AmountDue = op.AmountDue > 0 ? op.AmountDue : (soa?.TotalAmount ?? 0),
                AmountReceived = op.AmountReceived,
                Status = op.Status,
                CreatedAt = op.CreatedAt
            };
        }

        List<OfficialReceipt> matchingReceipts = new();
        OfficialReceipt? receipt = null;
        if (receiptRepository != null && app.TenantId != Guid.Empty)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(orNumber))
                {
                    var cleanOr = orNumber.TrimStart('#').Trim();
                    receipt = await receiptRepository.GetByOrNumberAsync(app.TenantId, cleanOr, cancellationToken)
                              ?? await receiptRepository.GetByOrNumberAsync(app.TenantId, orNumber.Trim(), cancellationToken);
                    if (receipt != null)
                    {
                        matchingReceipts.Add(receipt);
                    }
                }

                var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
                if (opReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(opReceipts);
                    receipt ??= opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                }

                var receipts = await receiptRepository.GetByTenantAsync(app.TenantId, cancellationToken: cancellationToken);
                var appReceipts = receipts
                    .Where(r => r.ApplicationId == app.Id || r.OrderOfPaymentId == op.Id)
                    .ToList();
                if (appReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(appReceipts);
                    receipt ??= appReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                }
            }
            catch
            {
                // Keep printing OP even if optional receipt enrichment fails
            }
        }

        IReadOnlyList<AgencyBankAccount>? bankAccounts = null;
        if (bankAccountRepository != null && app.TenantId != Guid.Empty)
        {
            try
            {
                bankAccounts = await bankAccountRepository.GetByTenantAsync(app.TenantId, activeOnly: true, cancellationToken);
            }
            catch
            {
                // Keep printing OP even if bank account lookup fails
            }
        }

        EDGE.Application.Applications.Dtos.RegionalSignatoriesDto? regionalSignatories = null;
        try
        {
            regionalSignatories = await repository.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, cancellationToken);
        }
        catch
        {
            // Keep printing OP even if optional signatory lookup fails
        }

        var printModel = OrderOfPaymentPrintMapper.MapToPrintModel(
            op: op,
            soa: soa,
            app: app,
            fundCluster: regionalConfig?.FundCluster,
            agencyBankAccounts: bankAccounts,
            receipt: receipt,
            overrideOrNumber: orNumber,
            receipts: matchingReceipts,
            regionalSignatories: regionalSignatories);
        await PopulateSignatorySignatureAsync(printModel, httpContext, cancellationToken);
        var pdfBytes = printingService.PrintOrderOfPayment(printModel);
        var fileName = SanitizePdfFileName($"OP_{op.OpNumber ?? app.ReferenceNumber ?? id.ToString()}.pdf");

        if (download == true)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    public static async Task<IResult> PrintOpById(
        Guid opId,
        IApplicationFullRepository repository,
        IFormPrintingService printingService,
        HttpContext httpContext,
        IRegionalConfigurationService? configService = null,
        IAgencyBankAccountRepository? bankAccountRepository = null,
        IOfficialReceiptRepository? receiptRepository = null,
        string? orNumber = null,
        [FromQuery] bool? download = null,
        CancellationToken cancellationToken = default)
    {
        var op = await repository.GetOpByIdAsync(opId, cancellationToken);
        if (op == null)
        {
            return Results.NotFound(new { message = $"Order of Payment with ID '{opId}' was not found." });
        }

        var app = op.Application ?? await repository.GetByIdWithDetailsAsync(op.ApplicationId, true, cancellationToken);
        var soa = op.StatementOfAccount ?? app?.StatementsOfAccount.FirstOrDefault(s => s.Id == op.StatementOfAccountId);

        var tenantId = app?.TenantId ?? Guid.Empty;
        var regionalConfig = configService != null && tenantId != Guid.Empty
            ? await configService.GetConfigurationAsync(tenantId, cancellationToken)
            : null;
        var bankAccounts = bankAccountRepository != null && tenantId != Guid.Empty
            ? await bankAccountRepository.GetByTenantAsync(tenantId, activeOnly: true, cancellationToken)
            : null;

        List<OfficialReceipt> matchingReceipts = new();
        OfficialReceipt? receipt = null;
        if (receiptRepository != null && tenantId != Guid.Empty)
        {
            if (!string.IsNullOrWhiteSpace(orNumber))
            {
                var cleanOr = orNumber.TrimStart('#').Trim();
                receipt = await receiptRepository.GetByOrNumberAsync(tenantId, cleanOr, cancellationToken)
                          ?? await receiptRepository.GetByOrNumberAsync(tenantId, orNumber.Trim(), cancellationToken);
                if (receipt != null)
                {
                    matchingReceipts.Add(receipt);
                }
            }

            var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
            if (opReceipts.Count > 0)
            {
                matchingReceipts.AddRange(opReceipts);
                receipt ??= opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
            }

            if (app != null)
            {
                var receipts = await receiptRepository.GetByTenantAsync(tenantId, cancellationToken: cancellationToken);
                var appReceipts = receipts
                    .Where(r => r.ApplicationId == app.Id || r.OrderOfPaymentId == op.Id)
                    .ToList();
                if (appReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(appReceipts);
                    receipt ??= receipts.OrderByDescending(r => r.IssuedAt)
                        .FirstOrDefault(r => r.ApplicationId == app.Id || r.OrderOfPaymentId == op.Id);
                }
            }
        }

        EDGE.Application.Applications.Dtos.RegionalSignatoriesDto? regionalSignatories = null;
        try
        {
            regionalSignatories = await repository.GetRegionalSignatoriesAsync(app?.TenantId, app?.RegionId, cancellationToken);
        }
        catch
        {
            // Keep printing OP even if optional signatory lookup fails
        }

        var printModel = OrderOfPaymentPrintMapper.MapToPrintModel(
            op: op,
            soa: soa,
            app: app,
            fundCluster: regionalConfig?.FundCluster,
            agencyBankAccounts: bankAccounts,
            receipt: receipt,
            overrideOrNumber: orNumber,
            receipts: matchingReceipts,
            regionalSignatories: regionalSignatories);
        await PopulateSignatorySignatureAsync(printModel, httpContext, cancellationToken);
        var pdfBytes = printingService.PrintOrderOfPayment(printModel);
        var fileName = SanitizePdfFileName($"OP_{op.OpNumber ?? opId.ToString()}.pdf");

        if (download == true)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    private static async Task PopulateSignatorySignatureAsync(
        OrderOfPaymentModel model,
        HttpContext? httpContext,
        CancellationToken cancellationToken)
    {
        try
        {
            if (model.CollectingOfficerSignatureBytes != null) return;

            var services = httpContext?.RequestServices;
            var userRepo = services?.GetService<IUserRepository>();
            var mediator = services?.GetService<IMediator>();

            if (string.IsNullOrWhiteSpace(model.CollectingOfficerSignature) && model.CollectingOfficerUserId.HasValue && userRepo != null)
            {
                var user = await userRepo.GetByIdAsync(model.CollectingOfficerUserId.Value, cancellationToken);
                model.CollectingOfficerSignature = user?.ESignature;
            }

            if (string.IsNullOrWhiteSpace(model.CollectingOfficerSignature)) return;

            var inlineBytes = SignatoryImageHelper.TryDecodeInlineSignatureBytes(model.CollectingOfficerSignature);
            if (inlineBytes != null)
            {
                model.CollectingOfficerSignatureBytes = inlineBytes;
                return;
            }

            if (mediator != null && Guid.TryParse(model.CollectingOfficerSignature.Trim(), out var fileId) && fileId != Guid.Empty)
            {
                var fileRes = await mediator.Send(new GetFileDownloadQuery(fileId, Guid.Empty), cancellationToken);
                if (fileRes.Succeeded && fileRes.Data?.FileStream != null)
                {
                    using var stream = fileRes.Data.FileStream;
                    using var ms = new MemoryStream();
                    await stream.CopyToAsync(ms, cancellationToken);
                    var bytes = ms.ToArray();
                    if (SignatoryImageHelper.IsSupportedRasterImage(bytes))
                    {
                        model.CollectingOfficerSignatureBytes = bytes;
                    }
                }
            }
        }
        catch
        {
            // Never fail OP PDF generation if optional signature lookup fails
        }
    }

    private static string SanitizePdfFileName(string rawName)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return "OP.pdf";
        var safeChars = rawName
            .Select(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == '.' ? ch : '_')
            .ToArray();
        var cleaned = new string(safeChars).Trim('_');
        return string.IsNullOrWhiteSpace(cleaned) ? "OP.pdf" : cleaned;
    }
}

public record UpdateOpNumberRequest(
    string OpNumber,
    string? Remarks = null,
    Guid? ApplicationId = null,
    Guid? StatementOfAccountId = null);
