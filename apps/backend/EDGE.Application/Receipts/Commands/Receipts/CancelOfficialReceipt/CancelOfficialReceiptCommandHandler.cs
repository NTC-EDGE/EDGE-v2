using System;
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

namespace EDGE.Application.Receipts.Commands.Receipts.CancelOfficialReceipt;

public record CancelOfficialReceiptCommand(
    Guid Id,
    string CancellationReason
) : IRequest<ApiResponse<OfficialReceiptDto>>;

public class CancelOfficialReceiptCommandValidator : AbstractValidator<CancelOfficialReceiptCommand>
{
    public CancelOfficialReceiptCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Official Receipt Id is required.");
        RuleFor(x => x.CancellationReason).NotEmpty().MaximumLength(500).WithMessage("Cancellation reason is required.");
    }
}

public class CancelOfficialReceiptCommandHandler : IRequestHandler<CancelOfficialReceiptCommand, ApiResponse<OfficialReceiptDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IApplicationFullRepository _appRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public CancelOfficialReceiptCommandHandler(
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

    public async Task<ApiResponse<OfficialReceiptDto>> Handle(CancelOfficialReceiptCommand request, CancellationToken cancellationToken)
    {
        var cashierContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        var receipt = await _receiptRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (receipt == null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Official Receipt not found.");
        }

        if (receipt.Status == ReceiptStatus.Cancelled)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Official Receipt is already cancelled.");
        }

        if (receipt.Status == ReceiptStatus.Deposited)
        {
            return ApiResponse<OfficialReceiptDto>.Fail("Cannot cancel an Official Receipt that has already been deposited to the bank.");
        }

        receipt.Status = ReceiptStatus.Cancelled;
        receipt.CancelledAt = DateTime.UtcNow;
        receipt.CancelledByUserId = cashierContext.UserId;
        receipt.CancellationReason = request.CancellationReason.Trim();

        // If tied to an Order of Payment, revert OP status to Billed/Processing so it can be settled again or corrected
        if (receipt.OrderOfPaymentId.HasValue)
        {
            var op = await _appRepository.GetOpByIdAsync(receipt.OrderOfPaymentId.Value, cancellationToken);
            if (op != null)
            {
                var prevOpStatus = op.Status;
                op.Status = OpStatus.Billed;
                op.OfficialReceiptNumber = null;
                op.AmountReceived = 0;
                op.PaidAt = null;

                Guid? validUserId = null;
                if (cashierContext.UserId.HasValue && await _appRepository.UserExistsAsync(cashierContext.UserId.Value, cancellationToken))
                {
                    validUserId = cashierContext.UserId.Value;
                }

                await _appRepository.AddOpHistoryAsync(new OpHistory
                {
                    Id = Guid.NewGuid(),
                    OrderOfPaymentId = op.Id,
                    Action = $"Official Receipt #{receipt.OfficialReceiptNumber} cancelled. Reason: {receipt.CancellationReason}",
                    FromStatus = prevOpStatus,
                    ToStatus = OpStatus.Billed,
                    PerformedByUserId = validUserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    OfficialReceiptNumber = receipt.OfficialReceiptNumber,
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);

                if (op.Application != null)
                {
                    var prevAppStatus = op.Application.Status;
                    op.Application.Status = ApplicationStatus.Approved;

                    await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = op.ApplicationId,
                        Action = $"Official Receipt #{receipt.OfficialReceiptNumber} cancelled. Status reverted to Approved.",
                        FromStatus = prevAppStatus,
                        ToStatus = ApplicationStatus.Approved,
                        PerformedByUserId = cashierContext.UserId,
                        StaffName = cashierContext.StaffName,
                        StaffRole = cashierContext.StaffRole,
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);
                }
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
            cashierContext.StaffName,
            receipt.CancellationReason,
            receipt.Remarks,
            receipt.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
        );

        return ApiResponse<OfficialReceiptDto>.Success(dto, $"Official Receipt #{receipt.OfficialReceiptNumber} cancelled successfully.");
    }
}
