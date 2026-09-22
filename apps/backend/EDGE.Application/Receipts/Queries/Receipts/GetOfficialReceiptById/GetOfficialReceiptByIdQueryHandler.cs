using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Receipts.GetOfficialReceiptById;

public record GetOfficialReceiptByIdQuery(Guid Id) : IRequest<ApiResponse<OfficialReceiptDto>>;

public class GetOfficialReceiptByIdQueryHandler : IRequestHandler<GetOfficialReceiptByIdQuery, ApiResponse<OfficialReceiptDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;

    public GetOfficialReceiptByIdQueryHandler(IOfficialReceiptRepository receiptRepository)
    {
        _receiptRepository = receiptRepository;
    }

    public async Task<ApiResponse<OfficialReceiptDto>> Handle(GetOfficialReceiptByIdQuery request, CancellationToken cancellationToken)
    {
        var r = await _receiptRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (r == null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Official Receipt not found.");
        }

        var dto = new OfficialReceiptDto(
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
            r.Deposit?.DepositSlipNumber,
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
        );

        return ApiResponse<OfficialReceiptDto>.Success(dto);
    }
}
