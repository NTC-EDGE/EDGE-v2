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

namespace EDGE.Application.Receipts.Commands.Receipts.IssueOfficialReceipt;

public record IssueOfficialReceiptCommand(
    Guid TenantId,
    Guid? OrderOfPaymentId = null,
    Guid? BookletId = null,
    string? ManualOrNumber = null,
    string PayorName = "",
    string? PayorAddress = null,
    decimal Amount = 0,
    PaymentMethod PaymentMethod = PaymentMethod.Cash,
    string? CheckNumber = null,
    string? CheckBank = null,
    DateTime? CheckDate = null,
    string? Remarks = null,
    List<CreateReceiptLineItemInput>? LineItems = null
) : IRequest<ApiResponse<OfficialReceiptDto>>;

public class IssueOfficialReceiptCommandValidator : AbstractValidator<IssueOfficialReceiptCommand>
{
    public IssueOfficialReceiptCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.PayorName).NotEmpty().WithMessage("Payor name is required.");
        RuleFor(x => x.Amount).GreaterThan(0).WithMessage("Receipt amount must be greater than 0.");
        RuleFor(x => x.PaymentMethod).IsInEnum().WithMessage("Valid payment method is required.");
        When(x => x.PaymentMethod == PaymentMethod.Check, () =>
        {
            RuleFor(x => x.CheckNumber).NotEmpty().WithMessage("Check number is required for check payments.");
            RuleFor(x => x.CheckBank).NotEmpty().WithMessage("Bank name is required for check payments.");
        });
    }
}

public class IssueOfficialReceiptCommandHandler : IRequestHandler<IssueOfficialReceiptCommand, ApiResponse<OfficialReceiptDto>>
{
    private readonly IOfficialReceiptRepository _receiptRepository;
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IApplicationFullRepository _appRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public IssueOfficialReceiptCommandHandler(
        IOfficialReceiptRepository receiptRepository,
        IOrBookletRepository bookletRepository,
        IApplicationFullRepository appRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _receiptRepository = receiptRepository;
        _bookletRepository = bookletRepository;
        _appRepository = appRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OfficialReceiptDto>> Handle(IssueOfficialReceiptCommand request, CancellationToken cancellationToken)
    {
        var cashierContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        OrBooklet? booklet = null;
        string orNumber;

        if (!string.IsNullOrWhiteSpace(request.ManualOrNumber))
        {
            orNumber = request.ManualOrNumber.Trim();
        }
        else
        {
            if (request.BookletId.HasValue)
            {
                booklet = await _bookletRepository.GetByIdAsync(request.BookletId.Value, cancellationToken);
            }
            else
            {
                booklet = await _bookletRepository.GetActiveBookletAsync(request.TenantId, cashierContext.UserId, cancellationToken)
                          ?? await _bookletRepository.GetActiveBookletAsync(request.TenantId, null, cancellationToken);
            }

            if (booklet == null)
            {
                return ApiResponse<OfficialReceiptDto>.Fail("No active OR booklet found for this tenant or cashier. Please register or assign an OR booklet.");
            }

            if (booklet.Status != BookletStatus.Active || booklet.RemainingCount <= 0)
            {
                return ApiResponse<OfficialReceiptDto>.Fail($"OR booklet '{booklet.BookletNumber}' is exhausted or inactive.");
            }

            orNumber = booklet.CurrentFormattedOrNumber;

            // Increment booklet counter
            booklet.CurrentNumber++;
            booklet.IssuedCount++;
            if (booklet.IssuedCount >= booklet.TotalCount || booklet.CurrentNumber > booklet.EndNumber)
            {
                booklet.Status = BookletStatus.Exhausted;
            }
            await _bookletRepository.UpdateAsync(booklet, cancellationToken);
        }

        var exists = await _receiptRepository.ExistsOrNumberAsync(request.TenantId, orNumber, null, cancellationToken);
        if (exists)
        {
            return ApiResponse<OfficialReceiptDto>.Fail($"Official Receipt number '{orNumber}' already exists.");
        }

        OrderOfPayment? op = null;
        Guid? applicationId = null;
        string? appNumber = null;

        if (request.OrderOfPaymentId.HasValue)
        {
            op = await _appRepository.GetOpByIdAsync(request.OrderOfPaymentId.Value, cancellationToken);
            if (op == null)
            {
                var appWithDetails = await _appRepository.GetByIdWithDetailsAsync(request.OrderOfPaymentId.Value, cancellationToken);
                if (appWithDetails != null)
                {
                    op = appWithDetails.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();
                    if (op == null)
                    {
                        applicationId = appWithDetails.Id;
                        appNumber = appWithDetails.ApplicationNumber;
                        var prevAppStatus = appWithDetails.Status;
                        appWithDetails.Status = ApplicationStatus.Completed;

                        await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                        {
                            Id = Guid.NewGuid(),
                            ApplicationId = appWithDetails.Id,
                            Action = $"Payment verified via OR #{orNumber}. Application completed.",
                            FromStatus = prevAppStatus,
                            ToStatus = ApplicationStatus.Completed,
                            PerformedByUserId = cashierContext.UserId,
                            StaffName = cashierContext.StaffName,
                            StaffRole = cashierContext.StaffRole,
                            Timestamp = DateTime.UtcNow
                        }, cancellationToken);
                    }
                }
                else
                {
                    return ApiResponse<OfficialReceiptDto>.Fail($"Order of Payment '{request.OrderOfPaymentId}' not found.");
                }
            }

            if (op != null)
            {
                applicationId = op.ApplicationId;
                if (op.Application != null)
                {
                    appNumber = op.Application.ApplicationNumber;
                }

                // Update OP Status to Paid
                var prevOpStatus = op.Status;
                op.Status = OpStatus.Paid;
                op.OfficialReceiptNumber = orNumber;
                op.AmountReceived = request.Amount;
                op.PaymentMethod = request.PaymentMethod;
                op.CheckNumber = request.CheckNumber;
                op.CheckBank = request.CheckBank;
                op.CheckDate = request.CheckDate;
                op.VerifiedByCashierId = cashierContext.UserId;
                op.PaidAt = DateTime.UtcNow;

                op.Histories.Add(new OpHistory
                {
                    Id = Guid.NewGuid(),
                    OrderOfPaymentId = op.Id,
                    Action = $"Payment received and Official Receipt issued: {orNumber}",
                    FromStatus = prevOpStatus,
                    ToStatus = OpStatus.Paid,
                    PerformedByUserId = cashierContext.UserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    OfficialReceiptNumber = orNumber,
                    Timestamp = DateTime.UtcNow
                });

                if (op.Application != null)
                {
                    var prevAppStatus = op.Application.Status;
                    op.Application.Status = ApplicationStatus.Completed;

                    await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                    {
                        Id = Guid.NewGuid(),
                        ApplicationId = op.ApplicationId,
                        Action = $"Payment verified via OR #{orNumber}. Application completed.",
                        FromStatus = prevAppStatus,
                        ToStatus = ApplicationStatus.Completed,
                        PerformedByUserId = cashierContext.UserId,
                        StaffName = cashierContext.StaffName,
                        StaffRole = cashierContext.StaffRole,
                        Timestamp = DateTime.UtcNow
                    }, cancellationToken);
                }
            }
        }

        var receipt = new OfficialReceipt
        {
            TenantId = request.TenantId,
            OfficialReceiptNumber = orNumber,
            BookletId = booklet?.Id,
            OrderOfPaymentId = op?.Id,
            ApplicationId = applicationId,
            PayorName = request.PayorName.Trim(),
            PayorAddress = request.PayorAddress?.Trim(),
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            CheckNumber = request.CheckNumber?.Trim(),
            CheckBank = request.CheckBank?.Trim(),
            CheckDate = request.CheckDate,
            Status = ReceiptStatus.Issued,
            IssuedAt = DateTime.UtcNow,
            IssuedByUserId = cashierContext.UserId,
            Remarks = request.Remarks?.Trim()
        };

        if (request.LineItems != null && request.LineItems.Count > 0)
        {
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
        else if (op != null)
        {
            // Default line item from OP if none provided
            receipt.LineItems.Add(new OfficialReceiptLineItem
            {
                OfficialReceiptId = receipt.Id,
                FeeCode = "PAYMENT",
                Description = $"Payment for OP #{op.OpNumber}",
                Amount = request.Amount
            });
        }

        await _receiptRepository.AddAsync(receipt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new OfficialReceiptDto(
            receipt.Id,
            receipt.TenantId,
            receipt.OfficialReceiptNumber,
            receipt.BookletId,
            booklet?.BookletNumber,
            receipt.OrderOfPaymentId,
            op?.OpNumber,
            receipt.ApplicationId,
            appNumber,
            receipt.PayorName,
            receipt.PayorAddress,
            receipt.Amount,
            receipt.PaymentMethod,
            receipt.CheckNumber,
            receipt.CheckBank,
            receipt.CheckDate,
            receipt.DepositId,
            null,
            receipt.Status,
            receipt.IssuedAt,
            receipt.IssuedByUserId,
            cashierContext.StaffName,
            receipt.CancelledAt,
            receipt.CancelledByUserId,
            null,
            receipt.CancellationReason,
            receipt.Remarks,
            receipt.LineItems.Select(l => new OfficialReceiptLineItemDto(l.Id, l.FeeCode, l.Description, l.Amount)).ToList()
        );

        return ApiResponse<OfficialReceiptDto>.Success(dto, $"Official Receipt #{orNumber} issued successfully.");
    }
}
