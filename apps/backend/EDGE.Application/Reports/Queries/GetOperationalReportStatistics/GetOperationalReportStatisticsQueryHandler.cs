using System;
using System.Collections.Generic;
using System.Globalization;
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
using FeedbackEntity = EDGE.Domain.Entities.Feedback;

namespace EDGE.Application.Reports.Queries.GetOperationalReportStatistics;

public class GetOperationalReportStatisticsQueryHandler : IRequestHandler<GetOperationalReportStatisticsQuery, ApiResponse<OperationalReportStatisticsDto>>
{
    private readonly IApplicationFullRepository _applicationRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;

    public GetOperationalReportStatisticsQueryHandler(
        IApplicationFullRepository applicationRepository,
        ITenantRepository tenantRepository,
        IFeedbackRepository feedbackRepository,
        ITenantContextService tenantContextService,
        ICurrentUserService currentUserService)
    {
        _applicationRepository = applicationRepository;
        _tenantRepository = tenantRepository;
        _feedbackRepository = feedbackRepository;
        _tenantContextService = tenantContextService;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<OperationalReportStatisticsDto>> Handle(GetOperationalReportStatisticsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<OperationalReportStatisticsDto>.Fail("401 Unauthorized: User authentication context missing.");
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
                    return ApiResponse<OperationalReportStatisticsDto>.Fail("403 Forbidden: User is not an active member of the requested tenant.");
                }
                targetTenantId = request.TenantId.Value;
            }
            else if (_tenantContextService.TenantId.HasValue && _tenantContextService.TenantId.Value != Guid.Empty)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberOfCurrentTenantAsync(cancellationToken);
                if (!isMember)
                {
                    return ApiResponse<OperationalReportStatisticsDto>.Fail("403 Forbidden: User is not authorized for current tenant context.");
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
            targetTenantId = request.TenantId;
        }

        // Fetch live applications dataset filtered by tenant with batched pagination
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
            if (batch == null || batch.Count == 0)
            {
                break;
            }

            tenantApps.AddRange(batch);

            if (pagedApps == null || !pagedApps.HasNextPage || tenantApps.Count >= pagedApps.TotalCount)
            {
                break;
            }

            currentAppPage++;
        }

        // Fetch live transactions dataset with batched pagination
        var transactions = new List<TenantTransactionDto>();
        if (targetTenantId.HasValue)
        {
            var currentTxPage = 1;
            while (transactions.Count < ReportConstants.MaxSafetyRecordThreshold)
            {
                var (txItems, totalTxCount) = await _tenantRepository.GetTenantTransactionsAsync(
                    targetTenantId.Value,
                    pageNumber: currentTxPage,
                    pageSize: ReportConstants.DefaultBatchPageSize,
                    cancellationToken: cancellationToken);

                if (txItems == null || txItems.Count == 0)
                {
                    break;
                }

                transactions.AddRange(txItems);

                if (transactions.Count >= totalTxCount || txItems.Count < ReportConstants.DefaultBatchPageSize)
                {
                    break;
                }

                currentTxPage++;
            }
        }

        // Fetch live feedback dataset scoped to tenant
        var allFeedback = await _feedbackRepository.GetByTenantAsync(targetTenantId, cancellationToken) ?? new List<FeedbackEntity>();

        // Selected filter intervals
        var activeYear = request.Year ?? DateTime.UtcNow.Year;
        var activeMonth = request.Month.HasValue ? request.Month.Value - 1 : DateTime.UtcNow.Month - 1; // 0-indexed for calculations
        var activeQuarter = request.Quarter ?? ((DateTime.UtcNow.Month - 1) / 3 + 1);
        var periodMode = (request.PeriodMode ?? "monthly").ToLowerInvariant();

        // Filter applications by period criteria
        var filteredApps = tenantApps.Where(a =>
        {
            var dt = a.CreatedAt;

            if (periodMode == "monthly")
            {
                return dt.Year == activeYear && dt.Month - 1 == activeMonth;
            }
            if (periodMode == "quarterly")
            {
                var q = (dt.Month - 1) / 3 + 1;
                return dt.Year == activeYear && q == activeQuarter;
            }
            if (periodMode == "yearly")
            {
                return dt.Year == activeYear;
            }
            // Rolling / default: last 30 days
            return dt >= DateTime.UtcNow.AddDays(-30);
        }).ToList();

        // Filter transactions by period criteria
        var filteredTx = transactions.Where(t =>
        {
            var dt = t.Date;

            if (periodMode == "monthly")
            {
                return dt.Year == activeYear && dt.Month - 1 == activeMonth;
            }
            if (periodMode == "quarterly")
            {
                var q = (dt.Month - 1) / 3 + 1;
                return dt.Year == activeYear && q == activeQuarter;
            }
            if (periodMode == "yearly")
            {
                return dt.Year == activeYear;
            }
            return dt >= DateTime.UtcNow.AddDays(-30);
        }).ToList();

        // Filter feedback by period criteria
        var filteredFeedback = allFeedback.Where(f =>
        {
            var dt = f.CreatedAt;
            if (periodMode == "monthly")
            {
                return dt.Year == activeYear && dt.Month - 1 == activeMonth;
            }
            if (periodMode == "quarterly")
            {
                var q = (dt.Month - 1) / 3 + 1;
                return dt.Year == activeYear && q == activeQuarter;
            }
            if (periodMode == "yearly")
            {
                return dt.Year == activeYear;
            }
            return dt >= DateTime.UtcNow.AddDays(-30);
        }).ToList();

        // 1. KPI Summary Calculation
        var totalApps = filteredApps.Count;
        var approvedCount = filteredApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Completed", StringComparison.OrdinalIgnoreCase));
        var evaluatingCount = filteredApps.Count(a => string.Equals(a.Status, "Evaluating", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Submitted", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Pending", StringComparison.OrdinalIgnoreCase));
        var returnedCount = filteredApps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Rejected", StringComparison.OrdinalIgnoreCase));
        var approvalRate = totalApps > 0 ? (int)Math.Round((double)approvedCount / totalApps * 100) : 100;

        var totalCollected = filteredTx.Where(t => string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)).Sum(t => t.Amount);
        var totalInvoiced = filteredTx.Sum(t => t.Amount);

        var csatTotal = filteredFeedback.Count;
        var avgCsat = csatTotal > 0
            ? (filteredFeedback.Average(f => f.Rating)).ToString("0.0", CultureInfo.InvariantCulture)
            : "5.0";

        var kpiSummary = new KpiSummaryDto(
            TotalApps: totalApps,
            ApprovedCount: approvedCount,
            EvaluatingCount: evaluatingCount,
            ReturnedCount: returnedCount,
            ApprovalRate: approvalRate,
            TotalCollected: totalCollected,
            TotalInvoiced: totalInvoiced,
            AvgCsat: avgCsat,
            CsatTotal: csatTotal
        );

        // 2. Category Breakdown
        var categoryBreakdown = ReportConstants.StandardCategories.Select(cat =>
        {
            var count = filteredApps.Count(a =>
                (!string.IsNullOrEmpty(a.ServiceCategory) && a.ServiceCategory.Contains(cat, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrEmpty(a.ServiceName) && a.ServiceName.Contains(cat, StringComparison.OrdinalIgnoreCase)));
            var pct = totalApps > 0 ? Math.Round((double)count / totalApps * 100, 1) : 0;
            return new CategoryBreakdownDto(cat, count, pct);
        }).ToList();

        // 3. Periodic Statistics Buckets
        var periodicStats = new List<PeriodicStatBucketDto>();
        if (periodMode == "monthly")
        {
            for (int m = 0; m < 12; m++)
            {
                var mApps = tenantApps.Where(a => a.CreatedAt.Year == activeYear && a.CreatedAt.Month - 1 == m).ToList();
                var mTx = transactions.Where(t => t.Date.Year == activeYear && t.Date.Month - 1 == m).ToList();
                var mFb = allFeedback.Where(f => f.CreatedAt.Year == activeYear && f.CreatedAt.Month - 1 == m).ToList();

                var mTotal = mApps.Count;
                var mAppr = mApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase));
                var mEval = mApps.Count(a => string.Equals(a.Status, "Evaluating", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Submitted", StringComparison.OrdinalIgnoreCase));
                var mRet = mApps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase));
                var mRate = mTotal > 0 ? (int)Math.Round((double)mAppr / mTotal * 100) : 100;
                var mRev = mTx.Where(t => string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)).Sum(t => t.Amount);
                var mCsat = mFb.Count > 0 ? mFb.Average(f => f.Rating).ToString("0.0", CultureInfo.InvariantCulture) : "5.0";

                periodicStats.Add(new PeriodicStatBucketDto(
                    Id: $"m-{m}",
                    Label: $"{ReportConstants.MonthNames[m]} {activeYear}",
                    ShortLabel: ReportConstants.MonthShortNames[m],
                    TotalApplications: mTotal,
                    ApprovedCount: mAppr,
                    EvaluatingCount: mEval,
                    ReturnedCount: mRet,
                    ApprovalRate: mRate,
                    TotalRevenue: mRev,
                    FeedbackCount: mFb.Count,
                    AvgCsat: mCsat
                ));
            }
        }
        else if (periodMode == "quarterly")
        {
            foreach (var (qCode, qLabel, startM, endM) in ReportConstants.QuarterDefinitions)
            {
                var qApps = tenantApps.Where(a => a.CreatedAt.Year == activeYear && a.CreatedAt.Month - 1 >= startM && a.CreatedAt.Month - 1 <= endM).ToList();
                var qTx = transactions.Where(t => t.Date.Year == activeYear && t.Date.Month - 1 >= startM && t.Date.Month - 1 <= endM).ToList();
                var qFb = allFeedback.Where(f => f.CreatedAt.Year == activeYear && f.CreatedAt.Month - 1 >= startM && f.CreatedAt.Month - 1 <= endM).ToList();

                var qTotal = qApps.Count;
                var qAppr = qApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase));
                var qEval = qApps.Count(a => string.Equals(a.Status, "Evaluating", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Submitted", StringComparison.OrdinalIgnoreCase));
                var qRet = qApps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase));
                var qRate = qTotal > 0 ? (int)Math.Round((double)qAppr / qTotal * 100) : 100;
                var qRev = qTx.Where(t => string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)).Sum(t => t.Amount);
                var qCsat = qFb.Count > 0 ? qFb.Average(f => f.Rating).ToString("0.0", CultureInfo.InvariantCulture) : "5.0";

                periodicStats.Add(new PeriodicStatBucketDto(
                    Id: $"q-{qCode}",
                    Label: $"{qCode} {activeYear} ({qLabel})",
                    ShortLabel: qCode,
                    TotalApplications: qTotal,
                    ApprovedCount: qAppr,
                    EvaluatingCount: qEval,
                    ReturnedCount: qRet,
                    ApprovalRate: qRate,
                    TotalRevenue: qRev,
                    FeedbackCount: qFb.Count,
                    AvgCsat: qCsat
                ));
            }
        }
        else if (periodMode == "yearly")
        {
            var years = new[] { activeYear - 2, activeYear - 1, activeYear };
            foreach (var yr in years)
            {
                var yrApps = tenantApps.Where(a => a.CreatedAt.Year == yr).ToList();
                var yrTx = transactions.Where(t => t.Date.Year == yr).ToList();
                var yrFb = allFeedback.Where(f => f.CreatedAt.Year == yr).ToList();

                var yrTotal = yrApps.Count;
                var yrAppr = yrApps.Count(a => string.Equals(a.Status, "Approved", StringComparison.OrdinalIgnoreCase));
                var yrEval = yrApps.Count(a => string.Equals(a.Status, "Evaluating", StringComparison.OrdinalIgnoreCase) || string.Equals(a.Status, "Submitted", StringComparison.OrdinalIgnoreCase));
                var yrRet = yrApps.Count(a => string.Equals(a.Status, "Returned", StringComparison.OrdinalIgnoreCase));
                var yrRate = yrTotal > 0 ? (int)Math.Round((double)yrAppr / yrTotal * 100) : 100;
                var yrRev = yrTx.Where(t => string.Equals(t.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase)).Sum(t => t.Amount);
                var yrCsat = yrFb.Count > 0 ? yrFb.Average(f => f.Rating).ToString("0.0", CultureInfo.InvariantCulture) : "5.0";

                periodicStats.Add(new PeriodicStatBucketDto(
                    Id: $"yr-{yr}",
                    Label: $"Year {yr}",
                    ShortLabel: yr.ToString(CultureInfo.InvariantCulture),
                    TotalApplications: yrTotal,
                    ApprovedCount: yrAppr,
                    EvaluatingCount: yrEval,
                    ReturnedCount: yrRet,
                    ApprovalRate: yrRate,
                    TotalRevenue: yrRev,
                    FeedbackCount: yrFb.Count,
                    AvgCsat: yrCsat
                ));
            }
        }
        else
        {
            foreach (var (bId, bLabel, bShort) in ReportConstants.RollingBuckets)
            {
                periodicStats.Add(new PeriodicStatBucketDto(
                    Id: bId,
                    Label: bLabel,
                    ShortLabel: bShort,
                    TotalApplications: totalApps,
                    ApprovedCount: approvedCount,
                    EvaluatingCount: evaluatingCount,
                    ReturnedCount: returnedCount,
                    ApprovalRate: approvalRate,
                    TotalRevenue: totalCollected,
                    FeedbackCount: csatTotal,
                    AvgCsat: avgCsat
                ));
            }
        }

        // 4. Statutory Government Submissions Summaries
        var statutorySummaries = new List<StatutoryReportSummaryDto>
        {
            new(
                Code: ReportConstants.BarNo1.Code,
                Title: ReportConstants.BarNo1.Title,
                Agency: ReportConstants.BarNo1.Agency,
                Frequency: ReportConstants.BarNo1.Frequency,
                LegalBasis: ReportConstants.BarNo1.LegalBasis,
                BadgeColor: ReportConstants.BarNo1.BadgeColor,
                RecordCount: totalApps,
                ComplianceRate: approvalRate,
                TotalAmount: null
            ),
            new(
                Code: ReportConstants.BTrCoa01.Code,
                Title: ReportConstants.BTrCoa01.Title,
                Agency: ReportConstants.BTrCoa01.Agency,
                Frequency: ReportConstants.BTrCoa01.Frequency,
                LegalBasis: ReportConstants.BTrCoa01.LegalBasis,
                BadgeColor: ReportConstants.BTrCoa01.BadgeColor,
                RecordCount: filteredTx.Count,
                ComplianceRate: 100,
                TotalAmount: totalCollected
            ),
            new(
                Code: ReportConstants.ArtaRa11032.Code,
                Title: ReportConstants.ArtaRa11032.Title,
                Agency: ReportConstants.ArtaRa11032.Agency,
                Frequency: ReportConstants.ArtaRa11032.Frequency,
                LegalBasis: ReportConstants.ArtaRa11032.LegalBasis,
                BadgeColor: ReportConstants.ArtaRa11032.BadgeColor,
                RecordCount: totalApps,
                ComplianceRate: approvalRate,
                TotalAmount: null
            ),
            new(
                Code: ReportConstants.SpectrumInventory.Code,
                Title: ReportConstants.SpectrumInventory.Title,
                Agency: ReportConstants.SpectrumInventory.Agency,
                Frequency: ReportConstants.SpectrumInventory.Frequency,
                LegalBasis: ReportConstants.SpectrumInventory.LegalBasis,
                BadgeColor: ReportConstants.SpectrumInventory.BadgeColor,
                RecordCount: filteredApps.Count(a => a.ServiceCategory != null && (a.ServiceCategory.Contains("Radio", StringComparison.OrdinalIgnoreCase) || a.ServiceCategory.Contains("Permit", StringComparison.OrdinalIgnoreCase))),
                ComplianceRate: 98,
                TotalAmount: null
            ),
            new(
                Code: ReportConstants.Csmr8888.Code,
                Title: ReportConstants.Csmr8888.Title,
                Agency: ReportConstants.Csmr8888.Agency,
                Frequency: ReportConstants.Csmr8888.Frequency,
                LegalBasis: ReportConstants.Csmr8888.LegalBasis,
                BadgeColor: ReportConstants.Csmr8888.BadgeColor,
                RecordCount: csatTotal,
                ComplianceRate: (int)Math.Round((double)filteredFeedback.Count(f => f.Rating >= 4) / Math.Max(csatTotal, 1) * 100),
                TotalAmount: null
            ),
            new(
                Code: ReportConstants.NovEnforcement.Code,
                Title: ReportConstants.NovEnforcement.Title,
                Agency: ReportConstants.NovEnforcement.Agency,
                Frequency: ReportConstants.NovEnforcement.Frequency,
                LegalBasis: ReportConstants.NovEnforcement.LegalBasis,
                BadgeColor: ReportConstants.NovEnforcement.BadgeColor,
                RecordCount: returnedCount,
                ComplianceRate: 95,
                TotalAmount: null
            )
        };

        var tenantDisplayName = targetTenantId.HasValue
            ? $"National Telecommunications Commission - Regional Office ({targetTenantId.Value.ToString()[..8].ToUpperInvariant()})"
            : "National Telecommunications Commission - Central Office";

        var result = new OperationalReportStatisticsDto(
            TenantDisplayName: tenantDisplayName,
            Summary: kpiSummary,
            CategoryBreakdown: categoryBreakdown,
            PeriodicStatistics: periodicStats,
            StatutoryReports: statutorySummaries
        );

        return ApiResponse<OperationalReportStatisticsDto>.Success(result, "Operational reports statistics aggregated successfully.");
    }
}
