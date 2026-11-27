using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Reports.DTOs;

namespace EDGE.Application.Reports.Queries.GenerateStatutoryReportPdf;

public sealed record GenerateStatutoryReportPdfQuery(
    string? Code = null,
    Guid? TenantId = null,
    string? Period = null,
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string? SecondaryFilter = null,
    string? FieldOffices = null,
    string? Format = null,
    string? ServiceType = null
) : IRequest<ApiResponse<StatutoryReportPdfResult>>;
