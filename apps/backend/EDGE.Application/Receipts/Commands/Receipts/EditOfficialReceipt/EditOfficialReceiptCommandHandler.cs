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

namespace EDGE.Application.Receipts.Commands.Receipts.EditOfficialReceipt;

public record EditOfficialReceiptCommand(
    Guid Id,
    string PayorName,
    string? PayorAddress = null,
    decimal Amount = 0,
    PaymentMethod PaymentMethod = PaymentMethod.Cash,
    string? CheckNumber = null,
    string? CheckBank = null,
    DateTime? CheckDate = null,
    string? Remarks = null,
    List<CreateReceiptLineItemInput>? LineItems = null
) : IRequest<ApiResponse<OfficialReceiptDto>>;

public class EditOfficialReceiptCommandValidator : AbstractValidator<EditOfficialReceiptCommand>
{
    public EditOfficialReceiptCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Official Receipt Id is required.");
        RuleFor(x => x.PayorName).NotEmpty().WithMessage("Payor name is required.");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Receipt amount must be greater than 0.");
        RuleFor(x => x.PaymentMethod).IsInEnum().WithMessage("Valid payment method is required.");
    }
}

public class EditOfficialReceiptCommandHandler : IRequestHandler<EditOfficialReceiptCommand, ApiResponse<OfficialReceiptDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IApplicationFullRepository _appRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public EditOfficialReceiptCommandHandler(
        IOfficialReceiptRepository receiptRepository,
        IApplicationFullRepository appRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _receiptRepository = receiptRepository;
        _appRepository = appRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OfficialReceiptDto>> Handle(EditOfficialReceiptCommand request, CancellationToken cancellationToken)
    {
        var cashierContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        var receipt = await _receiptRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (receipt == null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Official Receipt not found.");
        }

        if (receipt.Status == ReceiptStatus.Cancelled)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Cannot edit a cancelled Official Receipt.");
        }

        if (receipt.Status == ReceiptStatus.Deposited)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Cannot edit an Official Receipt that has already been deposited.");
        }

        receipt.PayorName = request.PayorName.Trim();
        receipt.PayorAddress = request.PayorAddress?.Trim();
        receipt.Amount = request.Amount;
        receipt.PaymentMethod = request.PaymentMethod;
        receipt.CheckNumber = request.CheckNumber?.Trim();
        receipt.CheckBank = request.CheckBank?.Trim();
        receipt.CheckDate = request.CheckDate;
        receipt.Remarks = request.Remarks?.Trim();

        if (request.LineItems != null)
        {
            receipt.LineItems.Clear();
            foreach (var item in request.LineItems)
            {
                receipt.LineItems.Add(new OfficialReceiptLineItem
                {
                    OfficialReceiptId = receipt.Id,
                    FeeCode = item.FeeCode.Trim(),
                    Description = item.Description.Trim(),
                    Amount = item.Amount
                });
            }
        }

        // If linked to OP, update OP's amount received and method
        if (receipt.OrderOfPaymentId.HasValue)
        {
            var op = await _appRepository.GetOpByIdAsync(receipt.OrderOfPaymentId.Value, cancellationToken);
            if (op != null)
            {
                op.AmountReceived = request.Amount;
                op.PaymentMethod = request.PaymentMethod;
                op.CheckNumber = request.CheckNumber;
                op.CheckBank = request.CheckBank;
                op.CheckDate = request.CheckDate;

                op.Histories.Add(new OpHistory
                {
                    Id = Guid.NewGuid(),
                    OrderOfPaymentId = op.Id,
                    Action = $"Official Receipt #{receipt.OfficialReceiptNumber} edited by cashier.",
                    FromStatus = op.Status,
                    ToStatus = op.Status,
                    PerformedByUserId = cashierContext.UserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    OfficialReceiptNumber = receipt.OfficialReceiptNumber,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        await _receiptRepository.UpdateAsync(receipt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        string? issuedByName = null;
        if (receipt.IssuedByUserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(receipt.IssuedByUserId.Value, cancellationToken);
            issuedByName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;
        }

        var dto = new OfficialReceiptDto(
            receipt.Id,
            receipt.TenantId,
            receipt.OfficialReceiptNumber,
            receipt.BookletId,
            receipt.Booklet?.BookletNumber,
            receipt.OrderOfPaymentId,
            receipt.OrderOfPayment?.OpNumber,
            receipt.ApplicationId,
            receipt.Application?.ApplicationNumber,
            receipt.PayorName,
            receipt.PayorAddress,
            receipt.Amount,
            receipt.PaymentMethod,
            receipt.CheckNumber,
            receipt.CheckBank,
            receipt.CheckDate,
            receipt.DepositId,
            receipt.Deposit?.DepositSlipNumber,
            receipt.Status,
            receipt.IssuedAt,
            receipt.IssuedByUserId,
            issuedByName,
            receipt.CancelledAt,
            receipt.CancelledByUserId,
            null,
            receipt.CancellationReason,
            receipt.Remarks,
            receipt.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
        );

        return ApiResponse<OfficialReceiptDto>.Success(dto, $"Official Receipt #{receipt.OfficialReceiptNumber} updated successfully.");
    }
}
