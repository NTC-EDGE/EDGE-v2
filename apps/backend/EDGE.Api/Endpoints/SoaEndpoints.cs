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
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Applications.Commands.ApproveSoa;
using EDGE.Application.Applications.Commands.ReturnSoa;
using EDGE.Application.Applications.Commands.UpdateSoaNumber;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Storage.Queries.GetFileDownload;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Authorization;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.AcroForm;
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

        group.MapPatch("/{soaId:guid}/number", UpdateSoaNumber)
            .WithName("UpdateSoaNumber")
            .WithSummary("Update Statement of Account (SOA) Number")
            .WithDescription("Allows updating the SOA number when manual SOA numbering is enabled for the regional office.");

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
            request?.SoaNoteId,
            request?.SoaNumber);

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
            ApplicationId: request?.ApplicationId,
            OpNumber: request?.OpNumber);
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
    public static async Task<IResult> UpdateSoaNumber(
        Guid soaId,
        UpdateSoaNumberRequest request,
        FluentValidation.IValidator<UpdateSoaNumberCommand> validator,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new UpdateSoaNumberCommand(
            SoaId: soaId,
            SoaNumber: request?.SoaNumber ?? string.Empty,
            Remarks: request?.Remarks);

        var validationResult = await validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(command, cancellationToken);
        return result.Succeeded ? Results.Ok(result) : Results.BadRequest(result);
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
        ISoaNoteRepository? soaNoteRepository = null,
        string? orNumber = null,
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
        var soa = (soaId.HasValue && soaId.Value != Guid.Empty)
            ? activeSoas.FirstOrDefault(s => s.Id == soaId.Value)
            : (applicantId.HasValue && applicantId.Value != Guid.Empty)
                ? activeSoas.FirstOrDefault(s => s.ApplicantId == applicantId.Value)
                : activeSoas.FirstOrDefault();

        // Prioritize paid Order of Payment linked to this SOA if one exists
        var paidOp = activeOps
            .Where(o => soa == null || o.StatementOfAccountId == soa.Id)
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault(o => o.Status == OpStatus.Paid || !string.IsNullOrWhiteSpace(o.OfficialReceiptNumber));

        var op = paidOp
            ?? (soa != null ? activeOps.OrderByDescending(o => o.CreatedAt).FirstOrDefault(o => o.StatementOfAccountId == soa.Id) : null)
            ?? activeOps.OrderByDescending(o => o.CreatedAt).FirstOrDefault();

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

                if (op != null)
                {
                    var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
                    if (opReceipts.Count > 0)
                    {
                        matchingReceipts.AddRange(opReceipts);
                        receipt ??= opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                    }
                }

                var receipts = await receiptRepository.GetByTenantAsync(app.TenantId, cancellationToken: cancellationToken);
                var appReceipts = receipts
                    .Where(r => r.ApplicationId == app.Id || (op != null && r.OrderOfPaymentId == op.Id))
                    .ToList();
                if (appReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(appReceipts);
                    receipt ??= appReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                }
            }
            catch
            {
                // Keep printing SOA even if optional receipt enrichment fails
            }
        }

        SoaNote? tenantSoaNote = soa?.SoaNote;
        try
        {
            if (tenantSoaNote == null && soa?.SoaNoteId.HasValue == true && soaNoteRepository != null)
            {
                tenantSoaNote = await soaNoteRepository.GetByIdAsync(soa.SoaNoteId.Value, cancellationToken);
            }

            if (tenantSoaNote == null && soaNoteRepository != null && app.TenantId != Guid.Empty)
            {
                var tenantNotes = await soaNoteRepository.GetAllAsync(app.TenantId, cancellationToken);
                tenantSoaNote = tenantNotes.FirstOrDefault(n => n.Code == "DEFAULT" || (n.Title != null && n.Title.Contains("Default", StringComparison.OrdinalIgnoreCase)))
                                ?? tenantNotes.FirstOrDefault();
            }
        }
        catch
        {
            // Keep printing SOA even if optional SOA note lookup fails
        }

        EDGE.Application.Applications.Dtos.RegionalSignatoriesDto? regionalSignatories = null;
        try
        {
            regionalSignatories = await repository.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, cancellationToken);
        }
        catch
        {
            // Fallback to default regional signatories when lookup fails
        }

        var printModel = StatementOfAccountPrintMapper.MapToPrintModel(
            soa: soa,
            app: app,
            op: op,
            regionalSignatories: regionalSignatories,
            receipt: receipt,
            overrideOrNumber: orNumber,
            receipts: matchingReceipts,
            tenantSoaNote: tenantSoaNote);
        await PopulateSignatorySignaturesAsync(printModel, httpContext, cancellationToken);
        var pdfBytes = printingService.PrintStatementOfAccount(printModel);
        var fileName = SanitizePdfFileName($"SOA_{printModel.AccountNo ?? id.ToString()}.pdf");

        if (download == true)
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
        ISoaNoteRepository? soaNoteRepository = null,
        string? orNumber = null,
        [FromQuery] bool? download = null,
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

            if (op != null)
            {
                var opReceipts = await receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
                if (opReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(opReceipts);
                    receipt ??= opReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                }
            }

            if (app != null)
            {
                var receipts = await receiptRepository.GetByTenantAsync(tenantId, cancellationToken: cancellationToken);
                var appReceipts = receipts
                    .Where(r => r.ApplicationId == app.Id || (op != null && r.OrderOfPaymentId == op.Id))
                    .ToList();
                if (appReceipts.Count > 0)
                {
                    matchingReceipts.AddRange(appReceipts);
                    receipt ??= appReceipts.OrderByDescending(r => r.IssuedAt).FirstOrDefault();
                }
            }
        }

        SoaNote? tenantSoaNote = soa.SoaNote;
        if (tenantSoaNote == null && soa.SoaNoteId.HasValue && soaNoteRepository != null)
        {
            tenantSoaNote = await soaNoteRepository.GetByIdAsync(soa.SoaNoteId.Value, cancellationToken);
        }

        if (tenantSoaNote == null && soaNoteRepository != null && tenantId != Guid.Empty)
        {
            var tenantNotes = await soaNoteRepository.GetAllAsync(tenantId, cancellationToken);
            tenantSoaNote = tenantNotes.FirstOrDefault(n => n.Code == "DEFAULT" || (n.Title != null && n.Title.Contains("Default", StringComparison.OrdinalIgnoreCase)))
                            ?? tenantNotes.FirstOrDefault();
        }

        var regionalSignatories = await repository.GetRegionalSignatoriesAsync(app?.TenantId, app?.RegionId, cancellationToken);
        var printModel = StatementOfAccountPrintMapper.MapToPrintModel(
            soa: soa,
            app: app,
            op: op,
            regionalSignatories: regionalSignatories,
            receipt: receipt,
            overrideOrNumber: orNumber,
            receipts: matchingReceipts,
            tenantSoaNote: tenantSoaNote);
        await PopulateSignatorySignaturesAsync(printModel, httpContext, cancellationToken);
        var pdfBytes = printingService.PrintStatementOfAccount(printModel);
        var fileName = SanitizePdfFileName($"SOA_{printModel.AccountNo ?? soaId.ToString()}.pdf");

        if (download == true)
        {
            return Results.File(pdfBytes, "application/pdf", fileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{fileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }

    private static async Task PopulateSignatorySignaturesAsync(
        StatementOfAccountModel model,
        HttpContext? httpContext,
        CancellationToken cancellationToken)
    {
        try
        {
            var services = httpContext?.RequestServices;
            var userRepo = services?.GetService<IUserRepository>();
            var mediator = services?.GetService<IMediator>();

            if (model.PreparedBySignatureBytes == null)
            {
                if (string.IsNullOrWhiteSpace(model.PreparedBySignature) && model.PreparedByUserId.HasValue && userRepo != null)
                {
                    var prepUser = await userRepo.GetByIdAsync(model.PreparedByUserId.Value, cancellationToken);
                    model.PreparedBySignature = prepUser?.ESignature;
                }
                model.PreparedBySignatureBytes = await ResolveSignatureImageBytesAsync(model.PreparedBySignature, mediator, cancellationToken);
            }

            if (model.ApprovedBySignatureBytes == null)
            {
                if (string.IsNullOrWhiteSpace(model.ApprovedBySignature) && model.ApprovedByUserId.HasValue && userRepo != null)
                {
                    var appUser = await userRepo.GetByIdAsync(model.ApprovedByUserId.Value, cancellationToken);
                    model.ApprovedBySignature = appUser?.ESignature;
                }
                model.ApprovedBySignatureBytes = await ResolveSignatureImageBytesAsync(model.ApprovedBySignature, mediator, cancellationToken);
            }
        }
        catch
        {
            // Never fail SOA PDF generation if optional signature lookup fails
        }
    }

    private static async Task<byte[]?> ResolveSignatureImageBytesAsync(
        string? rawSignature,
        IMediator? mediator,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawSignature)) return null;

        var inlineBytes = SignatoryImageHelper.TryDecodeInlineSignatureBytes(rawSignature);
        if (inlineBytes != null) return inlineBytes;

        if (mediator != null && Guid.TryParse(rawSignature.Trim(), out var fileId) && fileId != Guid.Empty)
        {
            try
            {
                var fileRes = await mediator.Send(new GetFileDownloadQuery(fileId, Guid.Empty), cancellationToken);
                if (fileRes.Succeeded && fileRes.Data?.FileStream != null)
                {
                    using var stream = fileRes.Data.FileStream;
                    using var ms = new MemoryStream();
                    await stream.CopyToAsync(ms, cancellationToken);
                    var bytes = ms.ToArray();
                    return SignatoryImageHelper.IsSupportedRasterImage(bytes) ? bytes : null;
                }
            }
            catch
            {
                // Ignore storage errors for optional signature image
            }
        }

        return null;
    }

    private static string SanitizePdfFileName(string rawName)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return "SOA.pdf";
        var safeChars = rawName
            .Select(ch => char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' || ch == '.' ? ch : '_')
            .ToArray();
        var cleaned = new string(safeChars).Trim('_');
        return string.IsNullOrWhiteSpace(cleaned) ? "SOA.pdf" : cleaned;
    }
}

public record UpdateSoaNumberRequest(string SoaNumber, string? Remarks = null);
