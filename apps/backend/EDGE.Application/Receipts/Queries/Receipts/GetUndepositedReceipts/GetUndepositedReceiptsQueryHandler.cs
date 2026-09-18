using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Receipts.GetUndepositedReceipts;

public record GetUndepositedReceiptsQuery(Guid TenantId) : IRequest<ApiResponse<List<OfficialReceiptDto>>>;

public class GetUndepositedReceiptsQueryHandler : IRequestHandler<GetUndepositedReceiptsQuery, ApiResponse<List<OfficialReceiptDto>>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;

    public GetUndepositedReceiptsQueryHandler(IOfficialReceiptRepository receiptRepository)
    {
        _receiptRepository = receiptRepository;
    }

    public async Task<ApiResponse<List<OfficialReceiptDto>>> Handle(GetUndepositedReceiptsQuery request, CancellationToken cancellationToken)
    {
        var receipts = await _receiptRepository.GetUndepositedReceiptsAsync(request.TenantId, cancellationToken);

        var dtos = receipts.Select(r => new OfficialReceiptDto(
            r.Id,
            r.TenantId,
            r.OfficialReceiptNumber,
            r.BookletId,
            r.Booklet?.BookletNumber,
            r.OrderOfPaymentId,
            r.OrderOfPayment?.OpNumber,
            r.ApplicationId,
            r.Application?.ApplicationNumber,
            r.PayorName,
            r.PayorAddress,
            r.Amount,
            r.PaymentMethod,
            r.CheckNumber,
            r.CheckBank,
            r.CheckDate,
            r.DepositId,
            null,
            r.Status,
            r.IssuedAt,
            r.IssuedByUserId,
            r.IssuedByUser != null ? $"{r.IssuedByUser.FirstName} {r.IssuedByUser.LastName}".Trim() : null,
            r.CancelledAt,
            r.CancelledByUserId,
            r.CancelledByUser != null ? $"{r.CancelledByUser.FirstName} {r.CancelledByUser.LastName}".Trim() : null,
            r.CancellationReason,
            r.Remarks,
            r.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
        )).ToList();

        return ApiResponse<List<OfficialReceiptDto>>.Success(dtos);
    }
}
