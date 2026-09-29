using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<IssueOfficialReceiptCommandHandler> _logger;

    public IssueOfficialReceiptCommandHandler(
        IOfficialReceiptRepository receiptRepository,
        IOrBookletRepository bookletRepository,
        IApplicationFullRepository appRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork,
        ILogger<IssueOfficialReceiptCommandHandler> logger)
    {
        _receiptRepository = receiptRepository;
        _bookletRepository = bookletRepository;
        _appRepository = appRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ApiResponse<OfficialReceiptDto>> Handle(IssueOfficialReceiptCommand request, CancellationToken cancellationToken)
    {
        var cashierContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        var (orNumber, booklet, orError) = await ResolveOrNumberAsync(request, cashierContext, cancellationToken);
        if (orError != null || orNumber == null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail(orError ?? "Failed to determine OR number.");
        }

        var exists = await _receiptRepository.ExistsOrNumberAsync(request.TenantId, orNumber, null, cancellationToken);
        if (exists)
        {
            _logger.LogWarning("Failed to issue official receipt. Official Receipt number '{OrNumber}' already exists for Tenant '{TenantId}'.", orNumber, request.TenantId);
            return ApiResponse<OfficialReceiptDto>.Fail($"Official Receipt number '{orNumber}' already exists.");
        }

        var (op, applicationId, appNumber, opError) = await ResolveOrderOfPaymentAsync(request, orNumber, cashierContext, cancellationToken);
        if (opError != null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail(opError);
        }

        var receipt = CreateReceiptEntity(request, orNumber, booklet, op, applicationId, cashierContext);

        await _receiptRepository.AddAsync(receipt, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = CreateReceiptDto(receipt, booklet, op, appNumber, cashierContext);

        _logger.LogInformation("Official Receipt #{OrNumber} successfully issued for Amount {Amount}. OrderOfPaymentId: {OrderOfPaymentId}, ApplicationId: {ApplicationId}, TenantId: {TenantId}, Cashier: '{CashierId}' ({CashierName}).", orNumber, request.Amount, op?.Id, applicationId, request.TenantId, cashierContext.UserId, cashierContext.StaffName);

        return ApiResponse<OfficialReceiptDto>.Success(dto, $"Official Receipt #{orNumber} issued successfully.");
    }

    private async Task<(string? OrNumber, OrBooklet? Booklet, string? Error)> ResolveOrNumberAsync(
        IssueOfficialReceiptCommand request,
        StaffUserContext cashierContext,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.ManualOrNumber))
        {
            return (request.ManualOrNumber.Trim(), null, null);
        }

        OrBooklet? booklet;
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
            _logger.LogWarning("Failed to issue official receipt. No active OR booklet found for Tenant '{TenantId}'. Cashier: '{CashierId}' ({CashierName}).", request.TenantId, cashierContext.UserId, cashierContext.StaffName);
            return (null, null, "No active OR booklet found for this tenant or cashier. Please register or assign an OR booklet.");
        }

        if (booklet.Status != BookletStatus.Active || booklet.RemainingCount <= 0)
        {
            _logger.LogWarning("Failed to issue official receipt. OR booklet '{BookletNumber}' is exhausted or inactive. Tenant: '{TenantId}', Cashier: '{CashierId}' ({CashierName}).", booklet.BookletNumber, request.TenantId, cashierContext.UserId, cashierContext.StaffName);
            return (null, null, $"OR booklet '{booklet.BookletNumber}' is exhausted or inactive.");
        }

        var orNumber = booklet.CurrentFormattedOrNumber;

        // Increment booklet counter
        booklet.CurrentNumber++;
        booklet.IssuedCount++;
        if (booklet.IssuedCount >= booklet.TotalCount || booklet.CurrentNumber > booklet.EndNumber)
        {
            booklet.Status = BookletStatus.Exhausted;
        }
        await _bookletRepository.UpdateAsync(booklet, cancellationToken);

        return (orNumber, booklet, null);
    }

    private async Task<(OrderOfPayment? Op, Guid? ApplicationId, string? AppNumber, string? Error)> ResolveOrderOfPaymentAsync(
        IssueOfficialReceiptCommand request,
        string orNumber,
        StaffUserContext cashierContext,
        CancellationToken cancellationToken)
    {
        if (!request.OrderOfPaymentId.HasValue)
        {
            return (null, null, null, null);
        }

        var op = await _appRepository.GetOpByIdAsync(request.OrderOfPaymentId.Value, cancellationToken);
        Guid? applicationId = null;
        string? appNumber = null;

        if (op == null)
        {
            var appWithDetails = await _appRepository.GetByIdWithDetailsAsync(request.OrderOfPaymentId.Value, cancellationToken);
            if (appWithDetails == null)
            {
                _logger.LogWarning("Failed to issue official receipt. Order of Payment / Application '{OrderOfPaymentId}' not found for Tenant '{TenantId}'. Performed by Cashier: '{CashierId}' ({CashierName}).", request.OrderOfPaymentId, request.TenantId, cashierContext.UserId, cashierContext.StaffName);
                return (null, null, null, $"Order of Payment '{request.OrderOfPaymentId}' not found.");
            }

            op = appWithDetails.OrdersOfPayment.OrderByDescending(o => o.CreatedAt).FirstOrDefault();
            if (op == null)
            {
                applicationId = appWithDetails.Id;
                appNumber = appWithDetails.ApplicationNumber;
                var prevAppStatus = appWithDetails.Status;
                appWithDetails.Status = ApplicationStatus.ForIssuance;

                await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appWithDetails.Id,
                    Action = $"Payment verified via OR #{orNumber}. Forwarded for Document & License Issuance.",
                    FromStatus = prevAppStatus,
                    ToStatus = ApplicationStatus.ForIssuance,
                    PerformedByUserId = cashierContext.UserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);
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
                op.Application.Status = ApplicationStatus.ForIssuance;

                await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = op.ApplicationId,
                    Action = $"Payment verified via OR #{orNumber}. Forwarded for Document & License Issuance.",
                    FromStatus = prevAppStatus,
                    ToStatus = ApplicationStatus.ForIssuance,
                    PerformedByUserId = cashierContext.UserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);
            }
        }

        return (op, applicationId, appNumber, null);
    }

    private static OfficialReceipt CreateReceiptEntity(
        IssueOfficialReceiptCommand request,
        string orNumber,
        OrBooklet? booklet,
        OrderOfPayment? op,
        Guid? applicationId,
        StaffUserContext cashierContext)
    {
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
            receipt.LineItems.Add(new OfficialReceiptLineItem
            {
                OfficialReceiptId = receipt.Id,
                FeeCode = "PAYMENT",
                Description = $"Payment for OP #{op.OpNumber}",
                Amount = request.Amount
            });
        }

        return receipt;
    }

    private static OfficialReceiptDto CreateReceiptDto(
        OfficialReceipt receipt,
        OrBooklet? booklet,
        OrderOfPayment? op,
        string? appNumber,
        StaffUserContext cashierContext)
    {
        return new OfficialReceiptDto(
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
    }
}
