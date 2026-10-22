using System;
using System.Collections.Generic;

namespace EDGE.Application.Reports.DTOs;

public record KpiSummaryDto(
    int TotalApps,
    int ApprovedCount,
    int EvaluatingCount,
    int ReturnedCount,
    int ApprovalRate,
    decimal TotalCollected,
    decimal TotalInvoiced,
    string AvgCsat,
    int CsatTotal
);

public record CategoryBreakdownDto(
    string Category,
    int Count,
    double Percentage
);

public record PeriodicStatBucketDto(
    string Id,
    string Label,
    string ShortLabel,
    int TotalApplications,
    int ApprovedCount,
    int EvaluatingCount,
    int ReturnedCount,
    int ApprovalRate,
    decimal TotalRevenue,
    int FeedbackCount,
    string AvgCsat
);

public record StatutoryReportSummaryDto(
    string Code,
    string Title,
    string Agency,
    string Frequency,
    string LegalBasis,
    string BadgeColor,
    int RecordCount,
    int ComplianceRate,
    decimal? TotalAmount
);

public record OperationalReportStatisticsDto(
    string TenantDisplayName,
    KpiSummaryDto Summary,
    List<CategoryBreakdownDto> CategoryBreakdown,
    List<PeriodicStatBucketDto> PeriodicStatistics,
    List<StatutoryReportSummaryDto> StatutoryReports
);
