using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Commands.Deposits.CreateBankDeposit;

public record CreateBankDepositCommand(
    Guid TenantId,
    string DepositSlipNumber,
    Guid BankAccountId,
    DateTime DepositDate,
    decimal CashAmount,
    decimal CheckAmount,
    List<Guid> OfficialReceiptIds,
    Guid? DepositSlipAttachmentId = null,
    string? Remarks = null
) : IRequest<ApiResponse<BankDepositDto>>;

public class CreateBankDepositCommandValidator : AbstractValidator<CreateBankDepositCommand>
{
    public CreateBankDepositCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.DepositSlipNumber).NotEmpty().MaximumLength(100).WithMessage("Deposit slip number is required.");
        RuleFor(x => x.BankAccountId).NotEmpty().WithMessage("Bank account is required.");
        RuleFor(x => x.DepositDate).NotEmpty().WithMessage("Deposit date is required.");
        RuleFor(x => x).Must(x => x.CashAmount > 0 || x.CheckAmount > 0 || (x.OfficialReceiptIds != null && x.OfficialReceiptIds.Count > 0))
            .WithMessage("Deposit must have at least cash, checks, or linked official receipts.");
    }
}

public class CreateBankDepositCommandHandler : IRequestHandler<CreateBankDepositCommand, ApiResponse<BankDepositDto>>
{
    private readonly IBankDepositRepository _depositRepository;
    private readonly IAgencyBankAccountRepository _bankAccountRepository;
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBankDepositCommandHandler(
        IBankDepositRepository depositRepository,
        IAgencyBankAccountRepository bankAccountRepository,
        IOfficialReceiptRepository receiptRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _depositRepository = depositRepository;
        _bankAccountRepository = bankAccountRepository;
        _receiptRepository = receiptRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<BankDepositDto>> Handle(CreateBankDepositCommand request, CancellationToken cancellationToken)
    {
        var cashierContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        var bankAccount = await _bankAccountRepository.GetByIdAsync(request.BankAccountId, cancellationToken);
        if (bankAccount == null || bankAccount.TenantId != request.TenantId)
        {
            return ApiResponse<BankDepositDto>.Fail("Agency bank account not found or does not belong to this tenant.");
        }

        var existsSlip = await _depositRepository.ExistsDepositSlipNumberAsync(request.TenantId, request.DepositSlipNumber.Trim(), null, cancellationToken);
        if (existsSlip)
        {
            return ApiResponse<BankDepositDto>.Fail($"Deposit slip number '{request.DepositSlipNumber}' already exists for this tenant.");
        }

        var deposit = new BankDeposit
        {
            TenantId = request.TenantId,
            DepositSlipNumber = request.DepositSlipNumber.Trim(),
            BankAccountId = request.BankAccountId,
            DepositDate = request.DepositDate,
            CashAmount = request.CashAmount,
            CheckAmount = request.CheckAmount,
            TotalAmount = request.CashAmount + request.CheckAmount,
            Status = DepositStatus.Deposited,
            DepositedByUserId = cashierContext.UserId,
            DepositSlipAttachmentId = request.DepositSlipAttachmentId,
            Remarks = request.Remarks?.Trim()
        };

        var linkedReceipts = new List<OfficialReceipt>();
        if (request.OfficialReceiptIds != null && request.OfficialReceiptIds.Count > 0)
        {
            foreach (var receiptId in request.OfficialReceiptIds)
            {
                var receipt = await _receiptRepository.GetByIdWithDetailsAsync(receiptId, cancellationToken);
                if (receipt != null && receipt.TenantId == request.TenantId && receipt.Status == ReceiptStatus.Issued)
                {
                    receipt.Status = ReceiptStatus.Deposited;
                    receipt.DepositId = deposit.Id;
                    linkedReceipts.Add(receipt);
                    deposit.Receipts.Add(receipt);
                }
            }
        }

        // If total amount was not explicitly provided but ORs are linked, recalculate amounts from ORs if zero
        if (deposit.TotalAmount == 0 && linkedReceipts.Count > 0)
        {
            deposit.CashAmount = linkedReceipts.Where(r => r.PaymentMethod == PaymentMethod.Cash).Sum(r => r.Amount);
            deposit.CheckAmount = linkedReceipts.Where(r => r.PaymentMethod == PaymentMethod.Check).Sum(r => r.Amount);
            deposit.TotalAmount = linkedReceipts.Sum(r => r.Amount);
        }

        await _depositRepository.AddAsync(deposit, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new BankDepositDto(
            deposit.Id,
            deposit.TenantId,
            deposit.DepositSlipNumber,
            deposit.BankAccountId,
            bankAccount.BankName,
            bankAccount.AccountNumber,
            bankAccount.AccountName,
            bankAccount.FundCluster,
            deposit.DepositDate,
            deposit.TotalAmount,
            deposit.CashAmount,
            deposit.CheckAmount,
            linkedReceipts.Count,
            deposit.Status,
            deposit.DepositedByUserId,
            cashierContext.StaffName,
            deposit.VerifiedByUserId,
            null,
            deposit.DepositSlipAttachmentId,
            deposit.Remarks,
            linkedReceipts.Select(r => new OfficialReceiptDto(
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
                deposit.DepositSlipNumber,
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

        return ApiResponse<BankDepositDto>.Success(dto, $"Bank deposit slip #{deposit.DepositSlipNumber} recorded successfully.");
    }
}
