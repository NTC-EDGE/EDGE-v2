using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Reports.GetCancelledOrReport;

public record GetCancelledOrReportQuery(
    Guid TenantId,
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<ApiResponse<CancelledOrReportDto>>;

public class GetCancelledOrReportQueryHandler : IRequestHandler<GetCancelledOrReportQuery, ApiResponse<CancelledOrReportDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly ITenantRepository _tenantRepository;

    public GetCancelledOrReportQueryHandler(
        IOfficialReceiptRepository receiptRepository,
        ITenantRepository tenantRepository)
    {
        _receiptRepository = receiptRepository;
        _tenantRepository = tenantRepository;
    }

    public async Task<ApiResponse<CancelledOrReportDto>> Handle(GetCancelledOrReportQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        var tenantName = tenant?.Name ?? "National Telecommunications Commission";

        var fromDate = request.FromDate ?? DateTime.UtcNow.Date.AddDays(-30);
        var toDate = request.ToDate ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        var receipts = await _receiptRepository.GetByTenantAsync(
            request.TenantId,
            ReceiptStatus.Cancelled,
            null,
            fromDate,
            toDate,
            null,
            null,
            cancellationToken);

        var items = receipts.Select(r => new CancelledOrItemDto(
            r.Id,
            r.OfficialReceiptNumber,
            r.IssuedAt,
            r.CancelledAt,
            r.PayorName,
            r.Amount,
            r.CancelledByUser != null ? $"{r.CancelledByUser.FirstName} {r.CancelledByUser.LastName}".Trim() : null,
            r.CancellationReason
        )).ToList();

        var report = new CancelledOrReportDto(
            request.TenantId,
            tenantName,
            fromDate,
            toDate,
            items.Count,
            items.Sum(i => i.Amount),
            items
        );

        return ApiResponse<CancelledOrReportDto>.Success(report);
    }
}
