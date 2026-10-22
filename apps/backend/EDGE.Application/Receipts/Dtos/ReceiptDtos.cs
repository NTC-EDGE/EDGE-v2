using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Application.Receipts.Dtos;

public record BookletCashierDto(
    Guid UserId,
    string FullName,
    bool IsPrimary = false
);

public record OrBookletDto(
    Guid Id,
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long EndNumber,
    long CurrentNumber,
    int TotalCount,
    int IssuedCount,
    int RemainingCount,
    string FormattedStartNumber,
    string FormattedEndNumber,
    string FormattedCurrentNumber,
    Guid? AssignedUserId,
    string? AssignedUserName,
    BookletStatus Status,
    DateTime ReceivedDate,
    string? Remarks,
    List<Guid>? AssignedUserIds = null,
    List<string>? AssignedUserNames = null,
    List<BookletCashierDto>? AssignedCashiers = null
);

public record OfficialReceiptLineItemDto(
    Guid Id,
    string FeeCode,
    string Description,
    decimal Amount
);

public record CreateReceiptLineItemInput(
    string FeeCode,
    string Description,
    decimal Amount
);

public record OfficialReceiptDto(
    Guid Id,
    Guid TenantId,
    string OfficialReceiptNumber,
    Guid? BookletId,
    string? BookletNumber,
    Guid? OrderOfPaymentId,
    string? OpNumber,
    Guid? ApplicationId,
    string? ApplicationNumber,
    string PayorName,
    string? PayorAddress,
    decimal Amount,
    PaymentMethod PaymentMethod,
    string? CheckNumber,
    string? CheckBank,
    DateTime? CheckDate,
    Guid? DepositId,
    string? DepositSlipNumber,
    ReceiptStatus Status,
    DateTime IssuedAt,
    Guid? IssuedByUserId,
    string? IssuedByUserName,
    DateTime? CancelledAt,
    Guid? CancelledByUserId,
    string? CancelledByUserName,
    string? CancellationReason,
    string? Remarks,
    List<OfficialReceiptLineItemDto> LineItems
);

public record AgencyBankAccountDto(
    Guid Id,
    Guid TenantId,
    string BankName,
    string AccountName,
    string AccountNumber,
    string? Branch,
    string FundCluster,
    bool IsActive,
    string? Remarks
);

public record BankDepositDto(
    Guid Id,
    Guid TenantId,
    string DepositSlipNumber,
    Guid BankAccountId,
    string BankName,
    string AccountNumber,
    string AccountName,
    string FundCluster,
    DateTime DepositDate,
    decimal TotalAmount,
    decimal CashAmount,
    decimal CheckAmount,
    int LinkedReceiptsCount,
    DepositStatus Status,
    Guid? DepositedByUserId,
    string? DepositedByUserName,
    Guid? VerifiedByUserId,
    string? VerifiedByUserName,
    Guid? DepositSlipAttachmentId,
    string? Remarks,
    List<OfficialReceiptDto> Receipts
);

public record CashierRcdSummaryDto(
    decimal TotalCollections,
    decimal TotalCash,
    decimal TotalCheck,
    decimal TotalOnline,
    decimal TotalDeposited,
    decimal NetUndepositedCashOnHand,
    int TotalTransactionsCount,
    int CancelledOrCount
);

public record CashierRcdReportDto(
    Guid TenantId,
    string TenantName,
    DateTime FromDate,
    DateTime ToDate,
    Guid? CashierUserId,
    string? CashierName,
    CashierRcdSummaryDto Summary,
    List<OrBookletDto> ActiveBooklets,
    List<OfficialReceiptDto> Collections,
    List<BankDepositDto> Deposits,
    List<OfficialReceiptDto> CancelledReceipts
);

public record CancelledOrItemDto(
    Guid Id,
    string OfficialReceiptNumber,
    DateTime IssuedAt,
    DateTime? CancelledAt,
    string PayorName,
    decimal Amount,
    string? CancelledByUserName,
    string? CancellationReason
);

public record CancelledOrReportDto(
    Guid TenantId,
    string TenantName,
    DateTime FromDate,
    DateTime ToDate,
    int TotalCancelledCount,
    decimal TotalCancelledAmount,
    List<CancelledOrItemDto> Items
);

public record ReceiptFeeItemDto(
    Guid Id,
    string FeeCode,
    string Name,
    string Description,
    decimal Amount,
    string SourceType,
    string? ServiceName = null,
    string? VariantName = null,
    string? ElementName = null
);
