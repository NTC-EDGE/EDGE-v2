using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.Constants;
using EDGE.Application.Reports.DTOs;
using EDGE.Application.Reports.Queries.GetOperationalReportStatistics;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Authorization;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;

namespace EDGE.Api.Endpoints;

public static class ReportEndpoints
{
    public static void MapReportEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/reports")
            .WithTags("Reports")
            .RequireAuthorization();

        group.MapGet("/statistics", GetOperationalReportStatistics)
            .WithName("GetOperationalReportStatistics")
            .WithSummary("Retrieve aggregated operational report statistics and statutory filing metrics.")
            .Produces<ApiResponse<OperationalReportStatisticsDto>>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        group.MapGet("/statutory/print", PrintStatutoryReport)
            .RequireRateLimiting(EDGE.Api.Services.RateLimitPolicies.HeavyCompute)
            .WithName("PrintStatutoryReport")
            .WithSummary("Generate and stream an official QuestPDF vector statutory report document.")
            .Produces(StatusCodes.Status200OK, contentType: "application/pdf")
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);

        group.MapGet("/statutory/download", (
            [FromQuery] string? code,
            [FromQuery] Guid? tenantId,
            [FromQuery] string? period,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? secondaryFilter,
            [FromQuery] string? fieldOffices,
            HttpContext httpContext,
            IApplicationFullRepository applicationRepository,
            ITenantRepository tenantRepository,
            IFieldOfficeRepository fieldOfficeRepository,
            IOfficialReceiptRepository receiptRepository,
            IBankDepositRepository depositRepository,
            IFeedbackRepository feedbackRepository,
            ITenantContextService tenantContextService,
            ICurrentUserService currentUserService,
            IUserRepository userRepository,
            ITenantMemberRepository tenantMemberRepository,
            IRegionalConfigurationService regionalConfigurationService,
            IFormPrintingService printingService,
            IValidator<GetOperationalReportStatisticsQuery> validator,
            CancellationToken cancellationToken) =>
            PrintStatutoryReport(
                code,
                tenantId,
                period,
                startDate,
                endDate,
                secondaryFilter,
                fieldOffices,
                httpContext,
                applicationRepository,
                tenantRepository,
                fieldOfficeRepository,
                receiptRepository,
                depositRepository,
                feedbackRepository,
                tenantContextService,
                currentUserService,
                userRepository,
                tenantMemberRepository,
                regionalConfigurationService,
                printingService,
                validator,
                download: true,
                cancellationToken))
            .RequireRateLimiting(EDGE.Api.Services.RateLimitPolicies.HeavyCompute)
            .WithName("DownloadStatutoryReport")
            .WithSummary("Download an official QuestPDF vector statutory report document.")
            .Produces(StatusCodes.Status200OK, contentType: "application/pdf")
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }

    public static async Task<IResult> GetOperationalReportStatistics(
        Guid? tenantId,
        string? periodMode,
        DateTime? startDate,
        DateTime? endDate,
        int? year,
        int? quarter,
        int? month,
        string? category,
        string? fieldOffices,
        IMediator mediator,
        IValidator<GetOperationalReportStatisticsQuery> validator,
        CancellationToken cancellationToken)
    {
        var query = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: periodMode,
            StartDate: startDate,
            EndDate: endDate,
            Year: year,
            Quarter: quarter,
            Month: month,
            Category: category,
            FieldOffices: fieldOffices
        );

        var validationResult = await validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        var result = await mediator.Send(query, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Message != null && result.Message.StartsWith("403", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Forbid();
            }
            if (result.Message != null && result.Message.StartsWith("401", StringComparison.OrdinalIgnoreCase))
            {
                return Results.Unauthorized();
            }
            return Results.BadRequest(result);
        }

        return Results.Ok(result);
    }

    public static async Task<IResult> PrintStatutoryReport(
        [FromQuery] string? code,
        [FromQuery] Guid? tenantId,
        [FromQuery] string? period,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? secondaryFilter,
        [FromQuery] string? fieldOffices,
        HttpContext httpContext,
        IApplicationFullRepository applicationRepository,
        ITenantRepository tenantRepository,
        IFieldOfficeRepository fieldOfficeRepository,
        IOfficialReceiptRepository receiptRepository,
        IBankDepositRepository depositRepository,
        IFeedbackRepository feedbackRepository,
        ITenantContextService tenantContextService,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        IRegionalConfigurationService regionalConfigurationService,
        IFormPrintingService printingService,
        IValidator<GetOperationalReportStatisticsQuery> validator,
        [FromQuery] bool download = false,
        CancellationToken cancellationToken = default)
    {
        var userIdStr = currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userIdStr))
        {
            return Results.Unauthorized();
        }

        var validationQuery = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: startDate.HasValue && endDate.HasValue ? "custom" : "monthly",
            StartDate: startDate,
            EndDate: endDate,
            Year: startDate?.Year ?? DateTime.UtcNow.Year,
            Quarter: null,
            Month: startDate?.Month ?? DateTime.UtcNow.Month,
            Category: "all"
        );

        var validationResult = await validator.ValidateAsync(validationQuery, cancellationToken);
        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(validationResult.ToDictionary());
        }

        Guid? targetTenantId = null;
        var isSuperAdmin = await tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        if (!isSuperAdmin)
        {
            if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            {
                var isMember = await tenantContextService.IsUserActiveMemberAsync(tenantId.Value, cancellationToken);
                if (!isMember)
                {
                    return Results.Forbid();
                }
                targetTenantId = tenantId.Value;
            }
            else if (tenantContextService.TenantId.HasValue && tenantContextService.TenantId.Value != Guid.Empty)
            {
                var isMember = await tenantContextService.IsUserActiveMemberOfCurrentTenantAsync(cancellationToken);
                if (!isMember)
                {
                    return Results.Forbid();
                }
                targetTenantId = tenantContextService.TenantId.Value;
            }
            else
            {
                var userTenants = await tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
                targetTenantId = userTenants.FirstOrDefault();
            }
        }
        else
        {
            targetTenantId = tenantId ?? tenantContextService.TenantId;
        }

        string tenantDisplayName = "NTC Regional Office (All Active Regions)";
        string fundCluster = "01101101";
        string regionalOfficeAddress = string.Empty;
        var reportSignatories = new ReportSignatoriesDto();
        if (targetTenantId.HasValue && targetTenantId.Value != Guid.Empty)
        {
            var tenantEntity = await tenantRepository.GetByIdAsync(targetTenantId.Value, cancellationToken);
            if (tenantEntity != null && !string.IsNullOrWhiteSpace(tenantEntity.Name))
            {
                tenantDisplayName = tenantEntity.Name;
            }
            else
            {
                tenantDisplayName = $"NTC Regional Office ({targetTenantId.Value.ToString()[..8].ToUpperInvariant()})";
            }

            try
            {
                var regionalConfig = await regionalConfigurationService.GetConfigurationAsync(targetTenantId.Value, cancellationToken);
                if (regionalConfig != null)
                {
                    if (!string.IsNullOrWhiteSpace(regionalConfig.FundCluster))
                    {
                        var trimmedCluster = regionalConfig.FundCluster.Trim();
                        fundCluster = string.Equals(trimmedCluster, "01", StringComparison.OrdinalIgnoreCase)
                            ? "01101101"
                            : trimmedCluster;
                    }
                    if (regionalConfig.ReportSignatories != null)
                    {
                        reportSignatories = regionalConfig.ReportSignatories;
                    }
                }
            }
            catch
            {
                // Keep default FundCluster and Signatories if regional config lookup fails
            }

            try
            {
                var tenantFieldOffices = await fieldOfficeRepository.GetByTenantIdAsync(targetTenantId.Value, cancellationToken);
                var mainOffice = tenantFieldOffices?.FirstOrDefault(fo =>
                    fo.Category.ToString().Contains("Main", StringComparison.OrdinalIgnoreCase) ||
                    fo.Name.Contains("Main Office", StringComparison.OrdinalIgnoreCase)) ?? tenantFieldOffices?.FirstOrDefault();
                if (mainOffice != null && !string.IsNullOrWhiteSpace(mainOffice.Address))
                {
                    regionalOfficeAddress = mainOffice.Address.Trim();
                }
            }
            catch
            {
                // Ignore field office address lookup errors
            }
        }

        var currentUser = await userRepository.ResolveCurrentUserAsync(currentUserService, cancellationToken);
        string fullName = currentUser != null ? $"{currentUser.FirstName} {currentUser.LastName}".Trim() : string.Empty;
        string generatedBy = !string.IsNullOrWhiteSpace(fullName)
            ? fullName
            : (currentUser?.Email ?? "Authorized Regional Officer");
        string generatedByTitle = string.Empty;
        if (currentUser != null && targetTenantId.HasValue && targetTenantId.Value != Guid.Empty)
        {
            try
            {
                var member = await tenantMemberRepository.GetByTenantAndUserAsync(targetTenantId.Value, currentUser.Id, cancellationToken);
                if (member != null)
                {
                    generatedByTitle = !string.IsNullOrWhiteSpace(member.Designation)
                        ? member.Designation.Trim()
                        : (!string.IsNullOrWhiteSpace(member.Position)
                            ? member.Position.Trim()
                            : (member.JobTitle?.Trim() ?? string.Empty));
                }
            }
            catch
            {
                // Ignore member title lookup failures
            }
        }

        // Load tenant applications
        var tenantApps = new List<ApplicationSummaryDto>();
        var currentAppPage = 1;
        while (tenantApps.Count < ReportConstants.MaxSafetyRecordThreshold)
        {
            var pagedApps = await applicationRepository.GetPagedApplicationSummaryDtosAsync(
                pageNumber: currentAppPage,
                pageSize: ReportConstants.DefaultBatchPageSize,
                tenantId: targetTenantId,
                cancellationToken: cancellationToken);

            var batch = pagedApps?.Items;
            if (batch == null || batch.Count == 0) break;

            tenantApps.AddRange(batch);
            if (pagedApps == null || !pagedApps.HasNextPage || tenantApps.Count >= pagedApps.TotalCount) break;
            currentAppPage++;
        }

        // Load tenant transactions (including Official Receipts, OPs, and SOAs; Guid.Empty queries all tenants when SuperAdmin views global scope)
        var transactions = new List<TenantTransactionDto>();
        var txQueryTenantId = targetTenantId ?? Guid.Empty;
        var currentTxPage = 1;
        while (transactions.Count < ReportConstants.MaxSafetyRecordThreshold)
        {
            var (txItems, totalTxCount) = await tenantRepository.GetTenantTransactionsAsync(
                txQueryTenantId,
                pageNumber: currentTxPage,
                pageSize: ReportConstants.DefaultBatchPageSize,
                cancellationToken: cancellationToken);

            if (txItems == null || txItems.Count == 0) break;
            transactions.AddRange(txItems);
            if (transactions.Count >= totalTxCount || txItems.Count < ReportConstants.DefaultBatchPageSize) break;
            currentTxPage++;
        }

        DateTime filterStart = startDate?.Date ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        DateTime filterEnd = endDate?.Date.AddDays(1).AddTicks(-1) ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        // Load Official Receipts (with LineItems & Deposit details) and BankDeposits for the period
        var allReceipts = await receiptRepository.GetByTenantAsync(
            txQueryTenantId,
            status: null,
            paymentMethod: null,
            fromDate: filterStart,
            toDate: filterEnd,
            cashierUserId: null,
            search: null,
            cancellationToken: cancellationToken);

        var validReceipts = allReceipts
            .Where(r => r.Status != ReceiptStatus.Cancelled)
            .OrderByDescending(r => r.IssuedAt)
            .ToList();

        var bankDeposits = await depositRepository.GetByTenantAsync(
            txQueryTenantId,
            bankAccountId: null,
            status: null,
            fromDate: filterStart,
            toDate: filterEnd,
            cancellationToken: cancellationToken);

        var allFeedback = await feedbackRepository.GetByTenantAsync(targetTenantId, cancellationToken);

        var filteredApps = tenantApps
            .Where(a => a.CreatedAt >= filterStart && a.CreatedAt <= filterEnd)
            .ToList();

        var filteredTx = transactions
            .Where(t => t.Date >= filterStart && t.Date <= filterEnd)
            .ToList();

        string? fieldOfficeFilterLabel = null;
        if (!string.IsNullOrWhiteSpace(fieldOffices) && !string.Equals(fieldOffices.Trim(), "all", StringComparison.OrdinalIgnoreCase))
        {
            var selectedTokens = fieldOffices
                .Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .ToList();

            if (selectedTokens.Count > 0)
            {
                fieldOfficeFilterLabel = string.Join(", ", selectedTokens);
                var selectedSet = new HashSet<string>(selectedTokens, StringComparer.OrdinalIgnoreCase);

                var tenantOffices = targetTenantId.HasValue && targetTenantId.Value != Guid.Empty
                    ? await fieldOfficeRepository.GetByTenantIdAsync(targetTenantId.Value, cancellationToken)
                    : new List<EDGE.Domain.Entities.FieldOffice>();

                bool includesMainOffice = selectedTokens.Any(t =>
                    t.Contains("Main Office", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(t, "MainOffice", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(t, tenantDisplayName, StringComparison.OrdinalIgnoreCase)) ||
                    (tenantOffices != null && tenantOffices.Any(fo =>
                        (fo.Category.ToString().Contains("Main", StringComparison.OrdinalIgnoreCase) || fo.Name.Contains("Main Office", StringComparison.OrdinalIgnoreCase)) &&
                        (selectedSet.Contains(fo.Name) || selectedSet.Contains(fo.Code) || selectedSet.Contains(fo.Id.ToString()))));

                bool MatchesSelectedFieldOffice(ApplicationSummaryDto app)
                {
                    var appOffice = (app.Office ?? string.Empty).Trim();
                    if (string.IsNullOrEmpty(appOffice) ||
                        string.Equals(appOffice, tenantDisplayName, StringComparison.OrdinalIgnoreCase) ||
                        appOffice.Contains("Main Office", StringComparison.OrdinalIgnoreCase))
                    {
                        return includesMainOffice;
                    }
                    if (selectedSet.Contains(appOffice))
                    {
                        return true;
                    }
                    if (tenantOffices != null)
                    {
                        foreach (var fo in tenantOffices)
                        {
                            bool isMainFo = fo.Category.ToString().Contains("Main", StringComparison.OrdinalIgnoreCase) ||
                                            fo.Name.Contains("Main Office", StringComparison.OrdinalIgnoreCase);
                            if (isMainFo) continue;

                            if (selectedSet.Contains(fo.Name) || selectedSet.Contains(fo.Code) || selectedSet.Contains(fo.Id.ToString()))
                            {
                                if (string.Equals(appOffice, fo.Name, StringComparison.OrdinalIgnoreCase) ||
                                    (!string.IsNullOrWhiteSpace(fo.Code) && string.Equals(appOffice, fo.Code, StringComparison.OrdinalIgnoreCase)) ||
                                    appOffice.Contains(fo.Name, StringComparison.OrdinalIgnoreCase) ||
                                    fo.Name.Contains(appOffice, StringComparison.OrdinalIgnoreCase))
                                {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }

                var allAppIds = new HashSet<Guid>(filteredApps.Select(a => a.Id));
                filteredApps = filteredApps.Where(MatchesSelectedFieldOffice).ToList();

                var matchedAppIds = new HashSet<Guid>(filteredApps.Select(a => a.Id));
                var matchedRefs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var a in filteredApps)
                {
                    if (!string.IsNullOrWhiteSpace(a.OfficialReceiptNumber)) matchedRefs.Add(a.OfficialReceiptNumber.Trim());
                    if (!string.IsNullOrWhiteSpace(a.OpNumber)) matchedRefs.Add(a.OpNumber.Trim());
                    if (!string.IsNullOrWhiteSpace(a.SoaNumber)) matchedRefs.Add(a.SoaNumber.Trim());
                    if (!string.IsNullOrWhiteSpace(a.ApplicationNumber)) matchedRefs.Add(a.ApplicationNumber.Trim());
                    if (!string.IsNullOrWhiteSpace(a.ReferenceNumber)) matchedRefs.Add(a.ReferenceNumber.Trim());
                }

                filteredTx = filteredTx.Where(tx =>
                {
                    if (matchedAppIds.Contains(tx.Id)) return true;
                    if (!string.IsNullOrWhiteSpace(tx.RefNo) && matchedRefs.Contains(tx.RefNo.Trim())) return true;
                    if (allAppIds.Contains(tx.Id)) return false;
                    return includesMainOffice;
                }).ToList();

                validReceipts = validReceipts.Where(r =>
                {
                    var rAppId = r.ApplicationId ?? r.OrderOfPayment?.ApplicationId;
                    if (rAppId.HasValue && rAppId.Value != Guid.Empty)
                    {
                        if (matchedAppIds.Contains(rAppId.Value)) return true;
                        if (allAppIds.Contains(rAppId.Value)) return false;
                    }
                    if (!string.IsNullOrWhiteSpace(r.OfficialReceiptNumber) && matchedRefs.Contains(r.OfficialReceiptNumber.Trim()))
                    {
                        return true;
                    }
                    return includesMainOffice;
                }).ToList();
            }
        }

        string normalizedCode = string.IsNullOrWhiteSpace(code) ? "NTC-MIS-OPS" : code.Trim().ToUpperInvariant();
        string trimmedSecondary = secondaryFilter?.Trim() ?? "all";

        // Apply report-specific secondary filtering
        if (normalizedCode == "NTC-EXAM-MST-01")
        {
            filteredApps = filteredApps.Where(a =>
            {
                string corpus = $"{a.ServiceCategory ?? ""} {a.ServiceName ?? ""} {a.ServiceVariantName ?? ""} {a.Element ?? ""}".ToLowerInvariant();
                return corpus.Contains("exam") || corpus.Contains("operator") || corpus.Contains("roce") || corpus.Contains("amateur") || corpus.Contains("rroc") || corpus.Contains("1-01");
            }).ToList();

            if (!string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
            {
                filteredApps = filteredApps.Where(a =>
                {
                    string examLabel = $"{a.ServiceVariantName ?? ""} {a.Element ?? ""} {a.ServiceName ?? ""}";
                    return examLabel.Contains(trimmedSecondary, StringComparison.OrdinalIgnoreCase);
                }).ToList();
            }
        }
        else if (normalizedCode == "NTC-APP-SUM-EVAL" && !string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
        {
            filteredApps = filteredApps.Where(a =>
            {
                string evalName = a.EvaluatingOfficer
                    ?? a.IssuedDocumentDetails?.FirstOrDefault()?.OriginalEvaluatorName
                    ?? a.AssignedOfficerName
                    ?? generatedBy;
                return string.Equals(evalName.Trim(), trimmedSecondary, StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }
        else if (normalizedCode == "NTC-APP-SUM-SVC" && !string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
        {
            filteredApps = filteredApps.Where(a =>
            {
                string svcName = a.ServiceName ?? a.Services?.FirstOrDefault()?.ServiceName ?? string.Empty;
                return string.Equals(svcName.Trim(), trimmedSecondary, StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }
        else if (normalizedCode == "NTC-APP-SUM-ENT" && !string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
        {
            filteredApps = filteredApps.Where(a =>
            {
                string entName = a.PayorName
                    ?? a.FilingUser?.Company?.Name
                    ?? a.FilingUser?.Name
                    ?? a.Applicants?.FirstOrDefault()?.Company?.Name
                    ?? a.Applicants?.FirstOrDefault()?.Name
                    ?? string.Empty;
                return string.Equals(entName.Trim(), trimmedSecondary, StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }

        var paidTx = filteredTx
            .Where(t =>
                string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(t.PaymentStatus, "Completed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(t.PaymentStatus, "Verified", StringComparison.OrdinalIgnoreCase))
            .ToList();

        // Deduplicate against OfficialReceipts and OrdersOfPayment by ID, ApplicationId, OrderOfPaymentId, and RefNo/OR Number
        var coveredIds = new HashSet<Guid>(paidTx.Select(t => t.Id));
        foreach (var r in validReceipts)
        {
            coveredIds.Add(r.Id);
            if (r.ApplicationId.HasValue) coveredIds.Add(r.ApplicationId.Value);
            if (r.OrderOfPaymentId.HasValue) coveredIds.Add(r.OrderOfPaymentId.Value);
        }

        var coveredRefNos = new HashSet<string>(
            paidTx.Select(t => t.RefNo?.Trim() ?? string.Empty).Where(s => s.Length > 0),
            StringComparer.OrdinalIgnoreCase);
        foreach (var r in validReceipts)
        {
            if (!string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
            {
                coveredRefNos.Add(r.OfficialReceiptNumber.Trim());
            }
        }

        foreach (var app in filteredApps)
        {
            if (coveredIds.Contains(app.Id)) continue;
            if (app.OrderOfPaymentId.HasValue && coveredIds.Contains(app.OrderOfPaymentId.Value)) continue;
            if (!string.IsNullOrWhiteSpace(app.OfficialReceiptNumber) && coveredRefNos.Contains(app.OfficialReceiptNumber.Trim())) continue;
            if (!string.IsNullOrWhiteSpace(app.OpNumber) && coveredRefNos.Contains(app.OpNumber.Trim())) continue;
            if (!string.IsNullOrWhiteSpace(app.SoaNumber) && coveredRefNos.Contains(app.SoaNumber.Trim())) continue;

            bool isPaidApp =
                !string.IsNullOrWhiteSpace(app.OfficialReceiptNumber) ||
                (app.AmountPaid.HasValue && app.AmountPaid.Value > 0m) ||
                string.Equals(app.Status, "ForIssuance", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(app.Status, "Approved", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(app.Status, "Completed", StringComparison.OrdinalIgnoreCase);

            decimal paidAmount = app.AmountPaid ?? app.TotalAmountDue ?? 0m;
            if (isPaidApp && paidAmount > 0m)
            {
                string refNo = !string.IsNullOrWhiteSpace(app.OfficialReceiptNumber)
                    ? app.OfficialReceiptNumber!
                    : (app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString("N")[..8].ToUpperInvariant());

                coveredIds.Add(app.Id);
                coveredRefNos.Add(refNo);

                paidTx.Add(new TenantTransactionDto(
                    Id: app.Id,
                    RefNo: refNo,
                    ApplicantName: app.PayorName
                        ?? app.FilingUser?.Company?.Name
                        ?? app.FilingUser?.Name
                        ?? app.Applicants?.FirstOrDefault()?.Name
                        ?? "Applicant",
                    ServiceType: app.ServiceName ?? app.ServiceCategory ?? "Regulatory Service",
                    Amount: paidAmount,
                    PaymentStatus: "Paid",
                    Date: app.PaidAt ?? app.UpdatedAt ?? app.CreatedAt
                ));
            }
        }

        var allTemplates = new[]
        {
            ReportConstants.MisOps,
            ReportConstants.CoaApp26Monthly,
            ReportConstants.CoaApp26Daily,
            ReportConstants.BirDst01,
            ReportConstants.BtrInc01,
            ReportConstants.AppSumEval,
            ReportConstants.AppSumSvc,
            ReportConstants.AppSumEnt,
            ReportConstants.AppVol01,
            ReportConstants.ExamMst01,
            ReportConstants.BarNo1,
            ReportConstants.BTrCoa01,
            ReportConstants.ArtaRa11032,
            ReportConstants.SpectrumInventory,
            ReportConstants.Csmr8888,
            ReportConstants.NovEnforcement
        };

        var matchedTemplate = allTemplates.FirstOrDefault(t => string.Equals(t.Code, normalizedCode, StringComparison.OrdinalIgnoreCase))
            ?? ReportConstants.MisOps;

        var filteredFeedback = (allFeedback ?? new List<EDGE.Domain.Entities.Feedback>())
            .Where(f => f.CreatedAt >= filterStart && f.CreatedAt <= filterEnd)
            .ToList();

        double avgCsat = filteredFeedback.Count > 0
            ? filteredFeedback.Average(f => f.Rating)
            : 5.0;

        string effectivePeriod = !string.IsNullOrWhiteSpace(period)
            ? period.Trim()
            : $"{filterStart:yyyy-MM-dd} to {filterEnd:yyyy-MM-dd}";

        var reportModel = new StatutoryReportModel
        {
            Code = matchedTemplate.Code,
            Title = matchedTemplate.Title,
            Agency = matchedTemplate.Agency,
            Frequency = matchedTemplate.Frequency,
            LegalBasis = matchedTemplate.LegalBasis,
            TenantName = tenantDisplayName,
            Period = effectivePeriod,
            StartDate = filterStart.ToString("yyyy-MM-dd"),
            EndDate = filterEnd.ToString("yyyy-MM-dd"),
            GeneratedBy = generatedBy,
            GeneratedByTitle = generatedByTitle,
            GeneratedAt = DateTime.UtcNow,
            FundCluster = fundCluster,
            RegionalOfficeAddress = regionalOfficeAddress,
            Signatories = reportSignatories,
            SecondaryFilter = trimmedSecondary,
            FieldOfficeFilter = fieldOfficeFilterLabel,
            Applications = filteredApps,
            Transactions = filteredTx,
            PaidTransactions = paidTx.OrderByDescending(t => t.Date).ToList(),
            OfficialReceipts = validReceipts,
            BankDeposits = bankDeposits,
            FeedbackCount = filteredFeedback.Count,
            AverageCsat = avgCsat
        };

        byte[] pdfBytes = printingService.PrintStatutoryReport(reportModel);
        string safeFileName = $"{reportModel.Code}_{reportModel.StartDate}_to_{reportModel.EndDate}.pdf".Replace(" ", "_");

        if (download)
        {
            return Results.File(pdfBytes, "application/pdf", safeFileName);
        }

        httpContext.Response.Headers.ContentDisposition = $"inline; filename=\"{safeFileName}\"";
        return Results.File(pdfBytes, "application/pdf", enableRangeProcessing: true);
    }
}
