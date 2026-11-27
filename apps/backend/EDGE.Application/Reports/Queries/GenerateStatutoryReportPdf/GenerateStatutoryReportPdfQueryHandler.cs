using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.Constants;
using EDGE.Application.Reports.DTOs;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Reports.Queries.GenerateStatutoryReportPdf;

public sealed class GenerateStatutoryReportPdfQueryHandler
    : IRequestHandler<GenerateStatutoryReportPdfQuery, ApiResponse<StatutoryReportPdfResult>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IBankDepositRepository _depositRepository;
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IRegionalConfigurationService _regionalConfigurationService;
    private readonly IStatutoryReportPdfGenerator _pdfGenerator;
    private readonly IClerkUserService? _clerkUserService;

    public GenerateStatutoryReportPdfQueryHandler(
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
        IStatutoryReportPdfGenerator pdfGenerator,
        IClerkUserService? clerkUserService = null)
    {
        _applicationRepository = applicationRepository;
        _tenantRepository = tenantRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
        _receiptRepository = receiptRepository;
        _depositRepository = depositRepository;
        _feedbackRepository = feedbackRepository;
        _tenantContextService = tenantContextService;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _regionalConfigurationService = regionalConfigurationService;
        _pdfGenerator = pdfGenerator;
        _clerkUserService = clerkUserService;
    }

    public async Task<ApiResponse<StatutoryReportPdfResult>> Handle(
        GenerateStatutoryReportPdfQuery request,
        CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrWhiteSpace(userIdStr))
        {
            return ApiResponse<StatutoryReportPdfResult>.Fail("401 Unauthorized: User authentication context missing.");
        }

        Guid? targetTenantId = null;
        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);

        if (!isSuperAdmin)
        {
            if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberAsync(request.TenantId.Value, cancellationToken);
                if (!isMember)
                {
                    return ApiResponse<StatutoryReportPdfResult>.Fail("403 Forbidden: User is not an active member of the requested tenant.");
                }
                targetTenantId = request.TenantId.Value;
            }
            else if (_tenantContextService.TenantId.HasValue && _tenantContextService.TenantId.Value != Guid.Empty)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberOfCurrentTenantAsync(cancellationToken);
                if (!isMember)
                {
                    return ApiResponse<StatutoryReportPdfResult>.Fail("403 Forbidden: User is not authorized for current tenant context.");
                }
                targetTenantId = _tenantContextService.TenantId.Value;
            }
            else
            {
                var userTenants = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
                targetTenantId = userTenants.FirstOrDefault();
            }
        }
        else
        {
            targetTenantId = request.TenantId ?? _tenantContextService.TenantId;
        }

        string tenantDisplayName = string.Empty;
        string fundCluster = string.Empty;
        string responsibilityCenterCode = string.Empty;
        string mfoPapCode = string.Empty;
        string regionalOfficeAddress = string.Empty;
        var reportSignatories = new ReportSignatoriesDto();
        List<FieldOffice> loadedTenantFieldOffices = new();

        if (targetTenantId.HasValue && targetTenantId.Value != Guid.Empty)
        {
            var tenantEntity = await _tenantRepository.GetByIdAsync(targetTenantId.Value, cancellationToken);
            if (tenantEntity != null)
            {
                if (!string.IsNullOrWhiteSpace(tenantEntity.Name))
                {
                    tenantDisplayName = tenantEntity.Name.Trim();
                }
                else if (!string.IsNullOrWhiteSpace(tenantEntity.Region?.Name))
                {
                    tenantDisplayName = tenantEntity.Region.Name.Trim();
                }
            }

            try
            {
                var regionalConfig = await _regionalConfigurationService.GetConfigurationAsync(targetTenantId.Value, cancellationToken);
                if (regionalConfig != null)
                {
                    if (string.IsNullOrWhiteSpace(tenantDisplayName) && !string.IsNullOrWhiteSpace(regionalConfig.TenantName))
                    {
                        tenantDisplayName = regionalConfig.TenantName.Trim();
                    }

                    if (!string.IsNullOrWhiteSpace(regionalConfig.FundCluster))
                    {
                        fundCluster = regionalConfig.FundCluster.Trim();
                    }

                    if (!string.IsNullOrWhiteSpace(regionalConfig.RcCodeSoa))
                    {
                        responsibilityCenterCode = regionalConfig.RcCodeSoa.Trim();
                    }
                    else if (!string.IsNullOrWhiteSpace(regionalConfig.RcCodeOp))
                    {
                        responsibilityCenterCode = regionalConfig.RcCodeOp.Trim();
                    }

                    if (!string.IsNullOrWhiteSpace(regionalConfig.MfoPapCode))
                    {
                        mfoPapCode = regionalConfig.MfoPapCode.Trim();
                    }

                    if (regionalConfig.ReportSignatories != null)
                    {
                        reportSignatories = regionalConfig.ReportSignatories;
                    }
                }
            }
            catch
            {
                // Keep empty defaults if regional configuration lookup fails
            }

            try
            {
                var tenantFieldOffices = await _fieldOfficeRepository.GetByTenantIdAsync(targetTenantId.Value, cancellationToken);
                if (tenantFieldOffices != null)
                {
                    loadedTenantFieldOffices = tenantFieldOffices;
                }

                var mainOffice = loadedTenantFieldOffices.FirstOrDefault(fo =>
                    fo.Category.ToString().Contains("Main", StringComparison.OrdinalIgnoreCase) ||
                    fo.Name.Contains("Main Office", StringComparison.OrdinalIgnoreCase)) ?? loadedTenantFieldOffices.FirstOrDefault();

                if (mainOffice != null && !string.IsNullOrWhiteSpace(mainOffice.Address))
                {
                    regionalOfficeAddress = mainOffice.Address.Trim();
                }
            }
            catch
            {
                // Keep address blank if field office lookup fails
            }
        }
        else
        {
            tenantDisplayName = "All Active Regional Offices";
        }

        var currentUser = await _userRepository.ResolveCurrentUserAsync(_currentUserService, cancellationToken);
        string dbFullName = currentUser?.GetFullName() ?? string.Empty;
        string generatedBy = !User.IsPlaceholderDisplayName(dbFullName) ? dbFullName : string.Empty;

        // If the DB record still has a seeded placeholder name (e.g. "Super Administrator" / "SuperAdmin"),
        // prefer the real name from JWT claims or Clerk profile instead of printing "SuperAdmin".
        if (string.IsNullOrWhiteSpace(generatedBy) && !User.IsPlaceholderDisplayName(_currentUserService.FullName))
        {
            generatedBy = _currentUserService.FullName!.Trim();
        }

        if (string.IsNullOrWhiteSpace(generatedBy) && _clerkUserService != null)
        {
            var authLookupId = !string.IsNullOrWhiteSpace(currentUser?.AuthUserId)
                ? currentUser.AuthUserId
                : _currentUserService.UserId;
            if (!string.IsNullOrWhiteSpace(authLookupId))
            {
                try
                {
                    var clerkProfile = await _clerkUserService.GetUserByIdAsync(authLookupId);
                    if (clerkProfile != null)
                    {
                        var clerkCombined = string.Join(" ", new[]
                        {
                            clerkProfile.FirstName,
                            currentUser?.MiddleName,
                            clerkProfile.LastName,
                            currentUser?.Suffix
                        }
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .Select(s => s!.Trim()));

                        if (!User.IsPlaceholderDisplayName(clerkCombined))
                        {
                            generatedBy = clerkCombined;
                        }
                    }
                }
                catch
                {
                    // Non-fatal: continue with safe fallback if Clerk lookup is unavailable
                }
            }
        }

        if (string.IsNullOrWhiteSpace(generatedBy))
        {
            generatedBy = "Authorized Officer";
        }

        string generatedByTitle = string.Empty;
        if (currentUser != null && targetTenantId.HasValue && targetTenantId.Value != Guid.Empty)
        {
            try
            {
                var member = await _tenantMemberRepository.GetByTenantAndUserAsync(targetTenantId.Value, currentUser.Id, cancellationToken);
                if (member != null)
                {
                    var candidateTitle = !string.IsNullOrWhiteSpace(member.Designation)
                        ? member.Designation.Trim()
                        : (!string.IsNullOrWhiteSpace(member.Position)
                            ? member.Position.Trim()
                            : (member.JobTitle?.Trim() ?? string.Empty));

                    // Never print "SuperAdmin" / "Super Administrator" as a formal report signatory designation
                    if (!User.IsPlaceholderDisplayName(candidateTitle))
                    {
                        generatedByTitle = candidateTitle;
                    }
                }
            }
            catch
            {
                // Keep generatedByTitle blank if lookup fails
            }
        }

        // Load tenant applications
        var tenantApps = new List<ApplicationSummaryDto>();
        var currentAppPage = 1;
        while (tenantApps.Count < ReportConstants.MaxSafetyRecordThreshold)
        {
            var pagedApps = await _applicationRepository.GetPagedApplicationSummaryDtosAsync(
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

        // Load tenant transactions
        var transactions = new List<TenantTransactionDto>();
        var txQueryTenantId = targetTenantId ?? Guid.Empty;
        var currentTxPage = 1;
        while (transactions.Count < ReportConstants.MaxSafetyRecordThreshold)
        {
            var (txItems, totalTxCount) = await _tenantRepository.GetTenantTransactionsAsync(
                txQueryTenantId,
                pageNumber: currentTxPage,
                pageSize: ReportConstants.DefaultBatchPageSize,
                cancellationToken: cancellationToken);

            if (txItems == null || txItems.Count == 0) break;
            transactions.AddRange(txItems);
            if (transactions.Count >= totalTxCount || txItems.Count < ReportConstants.DefaultBatchPageSize) break;
            currentTxPage++;
        }

        DateTime filterStart = request.StartDate?.Date ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        DateTime filterEnd = request.EndDate?.Date.AddDays(1).AddTicks(-1) ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        string normalizedCode = string.IsNullOrWhiteSpace(request.Code) ? "NTC-MIS-OPS" : request.Code.Trim().ToUpperInvariant();
        string effectiveFormat = string.Equals(request.Format?.Trim(), ReportConstants.FormatNtcSheet, StringComparison.OrdinalIgnoreCase)
            ? ReportConstants.FormatNtcSheet
            : ReportConstants.FormatStandard;
        string trimmedSecondary = request.SecondaryFilter?.Trim() ?? "all";
        string trimmedServiceType = request.ServiceType?.Trim() ?? "all";

        bool needsBankDeposits =
            normalizedCode == "NTC-MIS-OPS" ||
            normalizedCode == "NTC-COA-APP26-M" ||
            normalizedCode == "NTC-COA-APP26-D" ||
            normalizedCode == "NTC-BTR-INC-01" ||
            normalizedCode == "NTC-BTR-COA-01";

        bool needsYtdIncome =
            normalizedCode == "NTC-BTR-INC-01" &&
            string.Equals(effectiveFormat, ReportConstants.FormatNtcSheet, StringComparison.OrdinalIgnoreCase);

        bool needsFeedback =
            normalizedCode == "NTC-MIS-OPS" ||
            normalizedCode == "NTC-CSMR-8888" ||
            normalizedCode == "ARTA-RA-11032";

        var allReceipts = await _receiptRepository.GetByTenantAsync(
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

        var bankDeposits = needsBankDeposits
            ? await _depositRepository.GetByTenantAsync(
                txQueryTenantId,
                bankAccountId: null,
                status: null,
                fromDate: filterStart,
                toDate: filterEnd,
                cancellationToken: cancellationToken)
            : new List<BankDeposit>();

        var allFeedback = needsFeedback
            ? await _feedbackRepository.GetByTenantAsync(targetTenantId, cancellationToken)
            : new List<EDGE.Domain.Entities.Feedback>();

        var filteredApps = tenantApps
            .Where(a => a.CreatedAt >= filterStart && a.CreatedAt <= filterEnd)
            .ToList();

        var filteredTx = transactions
            .Where(t => t.Date >= filterStart && t.Date <= filterEnd)
            .ToList();

        string? fieldOfficeFilterLabel = null;
        if (!string.IsNullOrWhiteSpace(request.FieldOffices) && !string.Equals(request.FieldOffices.Trim(), "all", StringComparison.OrdinalIgnoreCase))
        {
            var selectedTokens = request.FieldOffices
                .Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .ToList();

            if (selectedTokens.Count > 0)
            {
                fieldOfficeFilterLabel = string.Join(", ", selectedTokens);
                var selectedSet = new HashSet<string>(selectedTokens, StringComparer.OrdinalIgnoreCase);
                var tenantOffices = loadedTenantFieldOffices;

                bool includesMainOffice = selectedTokens.Any(t =>
                    t.Contains("Main Office", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(t, "MainOffice", StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrWhiteSpace(tenantDisplayName) && string.Equals(t, tenantDisplayName, StringComparison.OrdinalIgnoreCase))) ||
                    tenantOffices.Any(fo =>
                        (fo.Category.ToString().Contains("Main", StringComparison.OrdinalIgnoreCase) || fo.Name.Contains("Main Office", StringComparison.OrdinalIgnoreCase)) &&
                        (selectedSet.Contains(fo.Name) || selectedSet.Contains(fo.Code) || selectedSet.Contains(fo.Id.ToString())));

                bool MatchesSelectedFieldOffice(ApplicationSummaryDto app)
                {
                    var appOffice = (app.Office ?? string.Empty).Trim();
                    if (string.IsNullOrEmpty(appOffice) ||
                        (!string.IsNullOrWhiteSpace(tenantDisplayName) && string.Equals(appOffice, tenantDisplayName, StringComparison.OrdinalIgnoreCase)) ||
                        appOffice.Contains("Main Office", StringComparison.OrdinalIgnoreCase))
                    {
                        return includesMainOffice;
                    }
                    if (selectedSet.Contains(appOffice))
                    {
                        return true;
                    }
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

        // Hydrate real staff full names (FirstName MiddleName LastName Suffix) onto applications
        // so historical placeholder snapshots ("SuperAdmin", "Super Administrator", emails, Clerk IDs)
        // never leak into evaluator / officer columns when the user has a real profile name.
        await HydrateRealStaffNamesAsync(filteredApps, currentUser, generatedBy, cancellationToken);

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
                    ?? a.IssuingOfficer
                    ?? string.Empty;
                return string.Equals(evalName.Trim(), trimmedSecondary, StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }
        else if (normalizedCode == "NTC-APP-SUM-SVC")
        {
            if (!string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
            {
                filteredApps = filteredApps.Where(a =>
                {
                    string svcName = a.ServiceName ?? a.Services?.FirstOrDefault()?.ServiceName ?? string.Empty;
                    return string.Equals(svcName.Trim(), trimmedSecondary, StringComparison.OrdinalIgnoreCase);
                }).ToList();
            }

            if (!string.IsNullOrWhiteSpace(trimmedServiceType) && !string.Equals(trimmedServiceType, "all", StringComparison.OrdinalIgnoreCase))
            {
                filteredApps = filteredApps.Where(a =>
                {
                    string filingType = a.ServiceVariantType
                        ?? a.Services?.FirstOrDefault()?.ApplicationType
                        ?? a.Applicants?.FirstOrDefault()?.ApplicationType
                        ?? a.ServiceVariantName
                        ?? (a.RenewedFromApplicationId.HasValue ? "RENEWAL" : "NEW");
                    return string.Equals(filingType.Trim(), trimmedServiceType, StringComparison.OrdinalIgnoreCase)
                        || filingType.Contains(trimmedServiceType, StringComparison.OrdinalIgnoreCase);
                }).ToList();
            }
        }
        else if (normalizedCode == "NTC-APP-SUM-ENT")
        {
            if (string.Equals(effectiveFormat, ReportConstants.FormatNtcSheet, StringComparison.OrdinalIgnoreCase))
            {
                // Per NTC FORMS & Reports specification: Only Completed Applications must be included in the Entity report
                filteredApps = filteredApps
                    .Where(a => string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(trimmedSecondary) && !string.Equals(trimmedSecondary, "all", StringComparison.OrdinalIgnoreCase))
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
        }

        var paidTx = filteredTx
            .Where(t =>
                string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(t.PaymentStatus, "Completed", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(t.PaymentStatus, "Verified", StringComparison.OrdinalIgnoreCase))
            .ToList();

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

        string effectivePeriod = !string.IsNullOrWhiteSpace(request.Period)
            ? request.Period.Trim()
            : $"{filterStart:yyyy-MM-dd} to {filterEnd:yyyy-MM-dd}";

        var ytdPaidTx = new List<TenantTransactionDto>();
        var ytdValidReceipts = new List<OfficialReceipt>();
        if (needsYtdIncome)
        {
            var ytdStart = new DateTime(filterEnd.Year, 1, 1);
            if (ytdStart < filterStart)
            {
                var ytdReceiptsRaw = await _receiptRepository.GetByTenantAsync(
                    txQueryTenantId,
                    status: null,
                    paymentMethod: null,
                    fromDate: ytdStart,
                    toDate: filterEnd,
                    cashierUserId: null,
                    search: null,
                    cancellationToken: cancellationToken);

                ytdValidReceipts = ytdReceiptsRaw
                    .Where(r => r.Status != ReceiptStatus.Cancelled)
                    .OrderByDescending(r => r.IssuedAt)
                    .ToList();

                ytdPaidTx = transactions
                    .Where(t => t.Date >= ytdStart && t.Date <= filterEnd && (
                        string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(t.PaymentStatus, "Completed", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(t.PaymentStatus, "Verified", StringComparison.OrdinalIgnoreCase)))
                    .ToList();

                var ytdCoveredIds = new HashSet<Guid>(ytdPaidTx.Select(t => t.Id));
                var ytdCoveredRefs = new HashSet<string>(
                    ytdPaidTx.Select(t => t.RefNo?.Trim() ?? string.Empty).Where(s => s.Length > 0),
                    StringComparer.OrdinalIgnoreCase);

                foreach (var r in ytdValidReceipts)
                {
                    ytdCoveredIds.Add(r.Id);
                    if (r.ApplicationId.HasValue) ytdCoveredIds.Add(r.ApplicationId.Value);
                    if (r.OrderOfPaymentId.HasValue) ytdCoveredIds.Add(r.OrderOfPaymentId.Value);
                    if (!string.IsNullOrWhiteSpace(r.OfficialReceiptNumber))
                    {
                        ytdCoveredRefs.Add(r.OfficialReceiptNumber.Trim());
                    }
                }

                foreach (var app in tenantApps.Where(a => a.CreatedAt >= ytdStart && a.CreatedAt <= filterEnd))
                {
                    if (ytdCoveredIds.Contains(app.Id)) continue;
                    if (app.OrderOfPaymentId.HasValue && ytdCoveredIds.Contains(app.OrderOfPaymentId.Value)) continue;
                    if (!string.IsNullOrWhiteSpace(app.OfficialReceiptNumber) && ytdCoveredRefs.Contains(app.OfficialReceiptNumber.Trim())) continue;

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

                        ytdCoveredIds.Add(app.Id);
                        ytdCoveredRefs.Add(refNo);

                        ytdPaidTx.Add(new TenantTransactionDto(
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
            }
            else
            {
                ytdPaidTx = paidTx.ToList();
                ytdValidReceipts = validReceipts.ToList();
            }
        }

        var documentData = new StatutoryReportDocumentData
        {
            Code = matchedTemplate.Code,
            Format = effectiveFormat,
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
            ResponsibilityCenterCode = responsibilityCenterCode,
            MfoPapCode = mfoPapCode,
            RegionalOfficeAddress = regionalOfficeAddress,
            Signatories = reportSignatories,
            SecondaryFilter = trimmedSecondary,
            ServiceTypeFilter = trimmedServiceType,
            FieldOfficeFilter = fieldOfficeFilterLabel,
            Applications = filteredApps,
            Transactions = filteredTx,
            PaidTransactions = paidTx.OrderByDescending(t => t.Date).ToList(),
            OfficialReceipts = validReceipts,
            YtdPaidTransactions = ytdPaidTx.OrderByDescending(t => t.Date).ToList(),
            YtdOfficialReceipts = ytdValidReceipts,
            BankDeposits = bankDeposits,
            FeedbackCount = filteredFeedback.Count,
            AverageCsat = avgCsat
        };

        byte[] pdfBytes = _pdfGenerator.GeneratePdf(documentData);
        string formatSuffix = string.Equals(effectiveFormat, ReportConstants.FormatNtcSheet, StringComparison.OrdinalIgnoreCase)
            ? $"_{effectiveFormat}"
            : string.Empty;
        string safeFileName = $"{documentData.Code}{formatSuffix}_{documentData.StartDate}_to_{documentData.EndDate}.pdf".Replace(" ", "_");

        return ApiResponse<StatutoryReportPdfResult>.Success(new StatutoryReportPdfResult(pdfBytes, safeFileName));
    }

    private async Task HydrateRealStaffNamesAsync(
        List<ApplicationSummaryDto> apps,
        User? currentUser,
        string resolvedCurrentUserName,
        CancellationToken cancellationToken)
    {
        if (apps.Count == 0) return;

        var realNameByUserId = new Dictionary<Guid, string>();
        if (currentUser != null && !User.IsPlaceholderDisplayName(resolvedCurrentUserName) && !string.Equals(resolvedCurrentUserName, "Authorized Officer", StringComparison.OrdinalIgnoreCase))
        {
            realNameByUserId[currentUser.Id] = resolvedCurrentUserName;
        }

        var referencedUserIds = new HashSet<Guid>();
        foreach (var app in apps)
        {
            if (app.Histories != null)
            {
                foreach (var h in app.Histories)
                {
                    if (h.PerformedByUserId.HasValue && h.PerformedByUserId.Value != Guid.Empty)
                    {
                        referencedUserIds.Add(h.PerformedByUserId.Value);
                    }
                }
            }

            if (app.IssuedDocumentDetails != null)
            {
                foreach (var d in app.IssuedDocumentDetails)
                {
                    if (d.OriginalEvaluatorUserId.HasValue && d.OriginalEvaluatorUserId.Value != Guid.Empty)
                    {
                        referencedUserIds.Add(d.OriginalEvaluatorUserId.Value);
                    }
                    if (d.IssuedByUserId.HasValue && d.IssuedByUserId.Value != Guid.Empty)
                    {
                        referencedUserIds.Add(d.IssuedByUserId.Value);
                    }
                }
            }
        }

        foreach (var uid in referencedUserIds)
        {
            if (realNameByUserId.ContainsKey(uid)) continue;
            try
            {
                var u = await _userRepository.GetByIdAsync(uid, cancellationToken);
                if (u == null) continue;
                var full = u.GetFullName();
                if (!User.IsPlaceholderDisplayName(full))
                {
                    realNameByUserId[uid] = full;
                }
            }
            catch
            {
                // Ignore transient individual user lookup failure
            }
        }

        string? ResolveHistoryRealName(ApplicationSummaryDto app, string? rawName)
        {
            if (!string.IsNullOrWhiteSpace(rawName) && !User.IsPlaceholderDisplayName(rawName))
            {
                return rawName.Trim();
            }

            // Look up the matching history entry's PerformedByUserId to replace placeholder snapshots
            if (app.Histories != null)
            {
                foreach (var h in app.Histories.OrderByDescending(x => x.Timestamp))
                {
                    if (!h.PerformedByUserId.HasValue) continue;
                    if (!realNameByUserId.TryGetValue(h.PerformedByUserId.Value, out var realName)) continue;

                    if (string.IsNullOrWhiteSpace(rawName) ||
                        string.Equals(h.StaffName?.Trim(), rawName.Trim(), StringComparison.OrdinalIgnoreCase) ||
                        User.IsPlaceholderDisplayName(h.StaffName))
                    {
                        return realName;
                    }
                }
            }

            if (app.IssuedDocumentDetails != null)
            {
                foreach (var d in app.IssuedDocumentDetails)
                {
                    if (d.OriginalEvaluatorUserId.HasValue && realNameByUserId.TryGetValue(d.OriginalEvaluatorUserId.Value, out var evalReal))
                    {
                        return evalReal;
                    }
                    if (d.IssuedByUserId.HasValue && realNameByUserId.TryGetValue(d.IssuedByUserId.Value, out var issuerReal))
                    {
                        return issuerReal;
                    }
                }
            }

            return User.IsPlaceholderDisplayName(rawName) ? null : rawName?.Trim();
        }

        foreach (var app in apps)
        {
            if (app.Histories != null)
            {
                foreach (var h in app.Histories)
                {
                    if (h.PerformedByUserId.HasValue &&
                        realNameByUserId.TryGetValue(h.PerformedByUserId.Value, out var realName) &&
                        User.IsPlaceholderDisplayName(h.StaffName))
                    {
                        h.StaffName = realName;
                    }
                }
            }

            if (app.IssuedDocumentDetails != null)
            {
                foreach (var d in app.IssuedDocumentDetails)
                {
                    if (d.OriginalEvaluatorUserId.HasValue &&
                        realNameByUserId.TryGetValue(d.OriginalEvaluatorUserId.Value, out var evalReal) &&
                        User.IsPlaceholderDisplayName(d.OriginalEvaluatorName))
                    {
                        d.OriginalEvaluatorName = evalReal;
                    }

                    if (d.IssuedByUserId.HasValue &&
                        realNameByUserId.TryGetValue(d.IssuedByUserId.Value, out var issuerReal) &&
                        User.IsPlaceholderDisplayName(d.IssuedByStaffName))
                    {
                        d.IssuedByStaffName = issuerReal;
                    }
                }
            }

            app.EvaluatingOfficer = ResolveHistoryRealName(app, app.EvaluatingOfficer);
            app.AssignedOfficerName = ResolveHistoryRealName(app, app.AssignedOfficerName);
            app.IssuingOfficer = ResolveHistoryRealName(app, app.IssuingOfficer);
            app.AccountingOfficer = ResolveHistoryRealName(app, app.AccountingOfficer);
            app.CashierOfficer = ResolveHistoryRealName(app, app.CashierOfficer);
        }
    }
}
