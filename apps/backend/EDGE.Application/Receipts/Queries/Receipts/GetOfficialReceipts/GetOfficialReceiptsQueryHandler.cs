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

namespace EDGE.Application.Receipts.Queries.Receipts.GetOfficialReceipts;

public record GetOfficialReceiptsQuery(
    Guid TenantId,
    ReceiptStatus? Status = null,
    PaymentMethod? PaymentMethod = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    string? CashierUserId = null,
    string? Search = null
) : IRequest<ApiResponse<List<OfficialReceiptDto>>>;

public class GetOfficialReceiptsQueryHandler : IRequestHandler<GetOfficialReceiptsQuery, ApiResponse<List<OfficialReceiptDto>>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IUserRepository _userRepository;

    public GetOfficialReceiptsQueryHandler(
        IOfficialReceiptRepository receiptRepository,
        IUserRepository userRepository)
    {
        _receiptRepository = receiptRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<List<OfficialReceiptDto>>> Handle(GetOfficialReceiptsQuery request, CancellationToken cancellationToken)
    {
        Guid? resolvedCashierId = null;
        if (!string.IsNullOrWhiteSpace(request.CashierUserId))
        {
            var userContext = await _userRepository.GetStaffUserContextAsync(request.CashierUserId, "Cashier", cancellationToken);
            resolvedCashierId = userContext.UserId;
        }

        var receipts = await _receiptRepository.GetByTenantAsync(
            request.TenantId,
            request.Status,
            request.PaymentMethod,
            request.FromDate,
            request.ToDate,
            resolvedCashierId,
            request.Search,
            cancellationToken);

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
        )).ToList();

        return ApiResponse<List<OfficialReceiptDto>>.Success(dtos);
    }
}
