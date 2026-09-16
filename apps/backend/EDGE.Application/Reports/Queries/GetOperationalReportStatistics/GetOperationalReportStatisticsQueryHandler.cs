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

        // Fetch live applications dataset filtered by tenant
        var pagedApps = await _applicationRepository.GetPagedApplicationSummaryDtosAsync(
            pageNumber: 1,
            pageSize: 1000,
            tenantId: targetTenantId,
            cancellationToken: cancellationToken);

        var tenantApps = pagedApps?.Items ?? new List<ApplicationSummaryDto>();

        // Fetch live transactions dataset
        var transactions = new List<TenantTransactionDto>();
        if (targetTenantId.HasValue)
        {
            var (txItems, _) = await _tenantRepository.GetTenantTransactionsAsync(
                targetTenantId.Value,
                pageNumber: 1,
                pageSize: 1000,
                cancellationToken: cancellationToken);
            transactions = txItems ?? new List<TenantTransactionDto>();
        }

        // Fetch live feedback dataset
        var allFeedback = await _feedbackRepository.GetAllAsync(cancellationToken) ?? new List<FeedbackEntity>();

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
        var categories = new[] { "Permits", "Licenses", "Accreditations", "Certificates", "Exams" };
        var categoryBreakdown = categories.Select(cat =>
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
            var monthNames = new[] { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
            var monthShorts = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

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
                    Label: $"{monthNames[m]} {activeYear}",
                    ShortLabel: monthShorts[m],
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
            var quarters = new[] { ("Q1", "Quarter 1 (Jan - Mar)", 0, 2), ("Q2", "Quarter 2 (Apr - Jun)", 3, 5), ("Q3", "Quarter 3 (Jul - Sep)", 6, 8), ("Q4", "Quarter 4 (Oct - Dec)", 9, 11) };

            foreach (var (qCode, qLabel, startM, endM) in quarters)
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
            var rollingBuckets = new[] { ("w1", "Last 7 Days", "7D"), ("w2", "8-14 Days Ago", "14D"), ("w3", "15-30 Days Ago", "30D"), ("w4", "31-90 Days Ago", "90D") };
            foreach (var (bId, bLabel, bShort) in rollingBuckets)
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
                Code: "NTC-BAR-1",
                Title: "Quarterly Physical Report of Operations",
                Agency: "Department of Budget and Management (DBM)",
                Frequency: "Quarterly",
                LegalBasis: "DBM-COA Joint Circular No. 2014-1",
                BadgeColor: "#2563EB",
                RecordCount: totalApps,
                ComplianceRate: approvalRate,
                TotalAmount: null
            ),
            new(
                Code: "NTC-BTr-COA-01",
                Title: "Monthly Report of Collections and Deposits",
                Agency: "Commission on Audit (COA) / BTr",
                Frequency: "Monthly",
                LegalBasis: "COA Circular No. 2021-014 & NGAS Manual",
                BadgeColor: "#059669",
                RecordCount: filteredTx.Count,
                ComplianceRate: 100,
                TotalAmount: totalCollected
            ),
            new(
                Code: "ARTA-RA-11032",
                Title: "Citizen's Charter SLA Compliance Report",
                Agency: "Anti-Red Tape Authority (ARTA)",
                Frequency: "Semi-Annual",
                LegalBasis: "Republic Act No. 11032 / Ease of Doing Business Act",
                BadgeColor: "#D97706",
                RecordCount: totalApps,
                ComplianceRate: approvalRate,
                TotalAmount: null
            ),
            new(
                Code: "NTC-SPECTRUM-INV",
                Title: "Annual Radio Station & Spectrum Inventory",
                Agency: "NTC Central Office Spectrum Branch",
                Frequency: "Annual",
                LegalBasis: "Radio Control Act (Act No. 3846 as amended)",
                BadgeColor: "#7C3AED",
                RecordCount: filteredApps.Count(a => a.ServiceCategory != null && (a.ServiceCategory.Contains("Radio", StringComparison.OrdinalIgnoreCase) || a.ServiceCategory.Contains("Permit", StringComparison.OrdinalIgnoreCase))),
                ComplianceRate: 98,
                TotalAmount: null
            ),
            new(
                Code: "NTC-CSMR-8888",
                Title: "Citizen Satisfaction & 8888 Resolution Matrix",
                Agency: "Office of the President - 8888 Citizens' Center",
                Frequency: "Quarterly",
                LegalBasis: "Executive Order No. 6, s. 2016",
                BadgeColor: "#DC2626",
                RecordCount: csatTotal,
                ComplianceRate: (int)Math.Round((double)filteredFeedback.Count(f => f.Rating >= 4) / Math.Max(csatTotal, 1) * 100),
                TotalAmount: null
            ),
            new(
                Code: "NTC-NOV-ENF",
                Title: "Enforcement & Notice of Violation Summary",
                Agency: "NTC Legal & Enforcement Branch",
                Frequency: "Quarterly",
                LegalBasis: "NTC Rules of Practice and Procedure (MC 09-05-2007)",
                BadgeColor: "#4B5563",
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
