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

namespace EDGE.Application.Receipts.Queries.Reports.GetCashierRcdReport;

public record GetCashierRcdReportQuery(
    Guid TenantId,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    Guid? CashierUserId = null
) : IRequest<ApiResponse<CashierRcdReportDto>>;

public class GetCashierRcdReportQueryHandler : IRequestHandler<GetCashierRcdReportQuery, ApiResponse<CashierRcdReportDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IBankDepositRepository _depositRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUserRepository _userRepository;

    public GetCashierRcdReportQueryHandler(
        IOfficialReceiptRepository receiptRepository,
        IOrBookletRepository bookletRepository,
        IBankDepositRepository depositRepository,
        ITenantRepository tenantRepository,
        IUserRepository userRepository)
    {
        _receiptRepository = receiptRepository;
        _bookletRepository = bookletRepository;
        _depositRepository = depositRepository;
        _tenantRepository = tenantRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<CashierRcdReportDto>> Handle(GetCashierRcdReportQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        var tenantName = tenant?.Name ?? "National Telecommunications Commission";

        var fromDate = request.FromDate ?? DateTime.UtcNow.Date;
        var toDate = request.ToDate ?? DateTime.UtcNow.Date.AddDays(1).AddTicks(-1);

        string? cashierName = null;
        if (request.CashierUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(request.CashierUserId.Value, cancellationToken);
            cashierName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;
        }

        var allReceipts = await _receiptRepository.GetByTenantAsync(
            request.TenantId,
            null,
            null,
            fromDate,
            toDate,
            request.CashierUserId,
            null,
            cancellationToken);

        var booklets = await _bookletRepository.GetByTenantAsync(request.TenantId, null, cancellationToken);
        var deposits = await _depositRepository.GetByTenantAsync(request.TenantId, null, null, fromDate, toDate, cancellationToken);

        var validCollections = allReceipts.Where(r => r.Status != ReceiptStatus.Cancelled).ToList();
        var cancelledReceipts = allReceipts.Where(r => r.Status == ReceiptStatus.Cancelled).ToList();

        var totalCash = validCollections.Where(r => r.PaymentMethod == PaymentMethod.Cash).Sum(r => r.Amount);
        var totalCheck = validCollections.Where(r => r.PaymentMethod == PaymentMethod.Check).Sum(r => r.Amount);
        var totalOnline = validCollections.Where(r => r.PaymentMethod == PaymentMethod.Online).Sum(r => r.Amount);
        var totalCollections = validCollections.Sum(r => r.Amount);

        var totalDeposited = deposits.Sum(d => d.TotalAmount);
        var netUndeposited = totalCash + totalCheck - totalDeposited;
        if (netUndeposited < 0) netUndeposited = 0;

        var summary = new CashierRcdSummaryDto(
            totalCollections,
            totalCash,
            totalCheck,
            totalOnline,
            totalDeposited,
            netUndeposited,
            validCollections.Count,
            cancelledReceipts.Count
        );

        var activeBookletDtos = booklets.Select(b => new OrBookletDto(
            b.Id,
            b.TenantId,
            b.BookletNumber,
            b.Prefix,
            b.StartNumber,
            b.EndNumber,
            b.CurrentNumber,
            b.TotalCount,
            b.IssuedCount,
            b.RemainingCount,
            b.FormatOrNumber(b.StartNumber),
            b.FormatOrNumber(b.EndNumber),
            b.CurrentFormattedOrNumber,
            b.AssignedUserId,
            b.AssignedUser != null ? $"{b.AssignedUser.FirstName} {b.AssignedUser.LastName}".Trim() : null,
            b.Status,
            b.ReceivedDate,
            b.Remarks
        )).ToList();

        var collectionDtos = validCollections.Select(r => new OfficialReceiptDto(
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
            null,
            r.CancellationReason,
            r.Remarks,
            r.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
        )).ToList();

        var cancelledDtos = cancelledReceipts.Select(r => new OfficialReceiptDto(
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

        var depositDtos = deposits.Select(d => new BankDepositDto(
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
            new List<OfficialReceiptDto>()
        )).ToList();

        var report = new CashierRcdReportDto(
            request.TenantId,
            tenantName,
            fromDate,
            toDate,
            request.CashierUserId,
            cashierName,
            summary,
            activeBookletDtos,
            collectionDtos,
            depositDtos,
            cancelledDtos
        );

        return ApiResponse<CashierRcdReportDto>.Success(report);
    }
}
