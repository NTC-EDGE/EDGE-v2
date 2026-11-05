using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.DTOs;

namespace EDGE.Application.Reports.Queries.GetOperationalReportStatistics;

public record GetOperationalReportStatisticsQuery(
    Guid? TenantId = null,
    string? PeriodMode = "monthly",
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    int? Year = null,
    int? Quarter = null,
    int? Month = null,
    string? Category = null
) : IRequest<ApiResponse<OperationalReportStatisticsDto>>;
