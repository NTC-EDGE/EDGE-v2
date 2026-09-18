using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Deposits.GetBankDepositById;

public record GetBankDepositByIdQuery(Guid Id) : IRequest<ApiResponse<BankDepositDto>>;

public class GetBankDepositByIdQueryHandler : IRequestHandler<GetBankDepositByIdQuery, ApiResponse<BankDepositDto>>
{
    private readonly IBankDepositRepository _depositRepository;

    public GetBankDepositByIdQueryHandler(IBankDepositRepository depositRepository)
    {
        _depositRepository = depositRepository;
    }

    public async Task<ApiResponse<BankDepositDto>> Handle(GetBankDepositByIdQuery request, CancellationToken cancellationToken)
    {
        var d = await _depositRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (d == null)
        {
            return ApiResponse<BankDepositDto>.Fail("Bank deposit not found.");
        }

        var dto = new BankDepositDto(
            d.Id,
            d.TenantId,
            d.DepositSlipNumber,
            d.BankAccountId,
            d.BankAccount?.BankName ?? "",
            d.BankAccount?.AccountNumber ?? "",
            d.BankAccount?.AccountName ?? "",
            d.BankAccount?.FundCluster ?? "",
            d.DepositDate,
            d.TotalAmount,
            d.CashAmount,
            d.CheckAmount,
            d.Receipts.Count,
            d.Status,
            d.DepositedByUserId,
            d.DepositedByUser != null ? $"{d.DepositedByUser.FirstName} {d.DepositedByUser.LastName}".Trim() : null,
            d.VerifiedByUserId,
            d.VerifiedByUser != null ? $"{d.VerifiedByUser.FirstName} {d.VerifiedByUser.LastName}".Trim() : null,
            d.DepositSlipAttachmentId,
            d.Remarks,
            d.Receipts.Select(r => new OfficialReceiptDto(
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
                d.DepositSlipNumber,
                r.Status,
                r.IssuedAt,
                r.IssuedByUserId,
                null,
                r.CancelledAt,
                r.CancelledByUserId,
                null,
                r.CancellationReason,
                r.Remarks,
                r.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
            )).ToList()
        );

        return ApiResponse<BankDepositDto>.Success(dto);
    }
}
