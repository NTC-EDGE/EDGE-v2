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

namespace EDGE.Application.Receipts.Queries.Deposits.GetBankDeposits;

public record GetBankDepositsQuery(
    Guid TenantId,
    Guid? BankAccountId = null,
    DepositStatus? Status = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null
) : IRequest<ApiResponse<List<BankDepositDto>>>;

public class GetBankDepositsQueryHandler : IRequestHandler<GetBankDepositsQuery, ApiResponse<List<BankDepositDto>>>
{
    private readonly IBankDepositRepository _depositRepository;

    public GetBankDepositsQueryHandler(IBankDepositRepository depositRepository)
    {
        _depositRepository = depositRepository;
    }

    public async Task<ApiResponse<List<BankDepositDto>>> Handle(GetBankDepositsQuery request, CancellationToken cancellationToken)
    {
        var deposits = await _depositRepository.GetByTenantAsync(
            request.TenantId,
            request.BankAccountId,
            request.Status,
            request.FromDate,
            request.ToDate,
            cancellationToken);

        var dtos = deposits.Select(d => new BankDepositDto(
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
        )).ToList();

        return ApiResponse<List<BankDepositDto>>.Success(dtos);
    }
}
