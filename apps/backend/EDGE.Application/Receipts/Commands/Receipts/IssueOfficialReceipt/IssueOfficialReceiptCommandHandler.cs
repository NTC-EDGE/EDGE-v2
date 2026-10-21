using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.Json.Nodes;
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
    List<CreateReceiptLineItemInput>? LineItems = null,
    bool AllowPartialPayment = false,
    DateTime? IssueDate = null,
    string? DateChangeReason = null
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
        When(x => x.IssueDate.HasValue && x.IssueDate.Value.Date != DateTime.UtcNow.Date, () =>
        {
            RuleFor(x => x.DateChangeReason)
                .NotEmpty()
                .WithMessage("A reason is required when overriding the Official Receipt issue date.");
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

        Guid? validUserId = null;
        if (cashierContext.UserId.HasValue && await _appRepository.UserExistsAsync(cashierContext.UserId.Value, cancellationToken))
        {
            validUserId = cashierContext.UserId.Value;
        }

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

        var (op, applicationId, appNumber, opError) = await ResolveOrderOfPaymentAsync(request, orNumber, cashierContext, validUserId, cancellationToken);
        if (opError != null)
        {
            return ApiResponse<OfficialReceiptDto>.Fail(opError);
        }

        var receipt = CreateReceiptEntity(request, orNumber, booklet, op, applicationId, validUserId);

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
        Guid? validUserId,
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
                return (null, null, null, $"Order of Payment / Application '{request.OrderOfPaymentId}' not found.");
            }

            op = appWithDetails.OrdersOfPayment
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefault(o => o.Status == OpStatus.Billed || o.Status == OpStatus.Processing);

            if (op == null)
            {
                var existingPaidOp = appWithDetails.OrdersOfPayment.FirstOrDefault(o => o.Status == OpStatus.Paid);
                if (existingPaidOp != null)
                {
                    return (null, null, null, $"Cannot issue Official Receipt: This application is already paid under Official Receipt #{existingPaidOp.OfficialReceiptNumber}.");
                }

                return (null, null, null, "Cannot issue Official Receipt: No active Order of Payment found for this application. The Statement of Account must first be approved by the Accountant and billed for payment before the client can proceed to payment.");
            }
        }

        if (op.Status == OpStatus.Paid)
        {
            return (null, null, null, $"Cannot issue Official Receipt: Order of Payment '{op.OpNumber}' is already paid under Official Receipt #{op.OfficialReceiptNumber}.");
        }

        if (op.Status == OpStatus.Returned)
        {
            return (null, null, null, $"Cannot issue Official Receipt: Order of Payment '{op.OpNumber}' was returned and cannot accept payment.");
        }

        var app = op.Application ?? (op.ApplicationId != Guid.Empty ? await _appRepository.GetByIdAsync(op.ApplicationId, cancellationToken) : null);
        if (app != null && app.Status != ApplicationStatus.PendingPayment)
        {
            return (null, null, null, $"Cannot issue Official Receipt: The application is currently in '{app.Status}' status. Payment can only be accepted when the application is in 'PendingPayment' status.");
        }

        var existingReceipts = await _receiptRepository.GetByOrderOfPaymentIdAsync(op.Id, cancellationToken);
        var priorValidReceipts = (existingReceipts ?? new List<OfficialReceipt>())
            .Where(r => r.Status != ReceiptStatus.Cancelled)
            .ToList();
        var priorAmount = priorValidReceipts.Sum(r => r.Amount);
        var totalAmountCovered = priorAmount + request.Amount;

        if (!request.AllowPartialPayment && totalAmountCovered < op.AmountDue)
        {
            return (null, null, null, FormattableString.Invariant($"Cannot issue Official Receipt: Received amount ({request.Amount:N2}) is less than the required amount due ({op.AmountDue:N2})."));
        }

        bool isFullyPaid = totalAmountCovered >= op.AmountDue;

        applicationId = op.ApplicationId;
        if (app != null)
        {
            appNumber = app.ApplicationNumber;
        }

        var prevOpStatus = op.Status;
        op.AmountReceived = totalAmountCovered;

        var existingOrList = (op.OfficialReceiptNumber ?? string.Empty)
            .Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
        if (!existingOrList.Contains(orNumber))
        {
            existingOrList.Add(orNumber);
        }
        op.OfficialReceiptNumber = string.Join(", ", existingOrList);

        op.PaymentMethod = request.PaymentMethod;
        if (!string.IsNullOrWhiteSpace(request.PayorName))
        {
            op.CheckName = request.PayorName.Trim();
        }
        if (request.PaymentMethod == PaymentMethod.Check)
        {
            op.CheckNumber = request.CheckNumber;
            op.CheckBank = request.CheckBank;
            op.CheckDate = request.CheckDate;
        }

        // Tag the matching payment breakdown item as issued in op.Remarks
        UpdateOpRemarksWithIssuedOr(op, orNumber, request.PaymentMethod, request.Amount, request.CheckNumber);

        if (isFullyPaid)
        {
            op.Status = OpStatus.Paid;
            op.VerifiedByCashierId = validUserId;
            op.PaidAt = DateTime.UtcNow;

            await _appRepository.AddOpHistoryAsync(new OpHistory
            {
                Id = Guid.NewGuid(),
                OrderOfPaymentId = op.Id,
                Action = FormattableString.Invariant($"Payment completed and Official Receipt issued: {orNumber} ({request.PaymentMethod}: ₱{request.Amount:N2}). All ORs: {op.OfficialReceiptNumber}."),
                FromStatus = prevOpStatus,
                ToStatus = OpStatus.Paid,
                PerformedByUserId = validUserId,
                StaffName = cashierContext.StaffName,
                StaffRole = cashierContext.StaffRole,
                OfficialReceiptNumber = orNumber,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            if (app != null)
            {
                var prevAppStatus = app.Status;
                app.Status = ApplicationStatus.ForIssuance;
                app.Remarks = $"Payment verified via Official Receipt #{op.OfficialReceiptNumber}. Forwarded for Document & License Issuance.";
                await _appRepository.UpdateAsync(app, cancellationToken);

                await _appRepository.AddApplicationStatusHistoryAsync(new ApplicationStatusHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    Status = ApplicationStatus.ForIssuance,
                    Remarks = $"Payment completed under Official Receipt #{op.OfficialReceiptNumber}. Forwarded for Document Issuance.",
                    Timestamp = DateTime.UtcNow,
                    UserId = validUserId
                }, cancellationToken);

                await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    Action = FormattableString.Invariant($"Payment verified via OR #{orNumber} ({request.PaymentMethod}: ₱{request.Amount:N2}). Total paid under: {op.OfficialReceiptNumber}."),
                    FromStatus = prevAppStatus,
                    ToStatus = ApplicationStatus.ForIssuance,
                    PerformedByUserId = validUserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    Remarks = request.Remarks ?? FormattableString.Invariant($"Payment received via {request.PaymentMethod}. Official Receipt #{orNumber} issued."),
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);
            }
        }
        else
        {
            op.Status = OpStatus.Processing;
            var remainingBalance = op.AmountDue - totalAmountCovered;

            await _appRepository.AddOpHistoryAsync(new OpHistory
            {
                Id = Guid.NewGuid(),
                OrderOfPaymentId = op.Id,
                Action = FormattableString.Invariant($"Partial payment received (₱{request.Amount:N2}) via {request.PaymentMethod}. Official Receipt #{orNumber} issued. Remaining balance: ₱{remainingBalance:N2}."),
                FromStatus = prevOpStatus,
                ToStatus = OpStatus.Processing,
                PerformedByUserId = validUserId,
                StaffName = cashierContext.StaffName,
                StaffRole = cashierContext.StaffRole,
                OfficialReceiptNumber = orNumber,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);

            if (app != null)
            {
                app.Remarks = FormattableString.Invariant($"Partial Official Receipt #{orNumber} issued for ₱{request.Amount:N2} ({request.PaymentMethod}). Remaining balance: ₱{remainingBalance:N2}.");
                await _appRepository.UpdateAsync(app, cancellationToken);

                await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    Action = FormattableString.Invariant($"Partial payment of ₱{request.Amount:N2} ({request.PaymentMethod}) accepted via OR #{orNumber}. Remaining balance: ₱{remainingBalance:N2}."),
                    FromStatus = app.Status,
                    ToStatus = app.Status,
                    PerformedByUserId = validUserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    Remarks = request.Remarks,
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);
            }
        }

        if (request.IssueDate.HasValue && request.IssueDate.Value.Date != DateTime.UtcNow.Date)
        {
            var originalDate = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var modifiedDate = request.IssueDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var dateAuditRemark = FormattableString.Invariant($"OR Issue Date manually overridden from {originalDate} to {modifiedDate}. Reason: {request.DateChangeReason?.Trim()}");

            if (app != null)
            {
                await _appRepository.AddApplicationHistoryAsync(new ApplicationHistory
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = app.Id,
                    Action = FormattableString.Invariant($"OR Date Override ({orNumber})"),
                    FromStatus = app.Status,
                    ToStatus = app.Status,
                    PerformedByUserId = validUserId,
                    StaffName = cashierContext.StaffName,
                    StaffRole = cashierContext.StaffRole,
                    Remarks = dateAuditRemark,
                    Timestamp = DateTime.UtcNow
                }, cancellationToken);
            }

            await _appRepository.AddOpHistoryAsync(new OpHistory
            {
                Id = Guid.NewGuid(),
                OrderOfPaymentId = op.Id,
                Action = FormattableString.Invariant($"OR Date Override ({orNumber}): {originalDate} -> {modifiedDate}"),
                FromStatus = op.Status,
                ToStatus = op.Status,
                PerformedByUserId = validUserId,
                StaffName = cashierContext.StaffName,
                StaffRole = cashierContext.StaffRole,
                OfficialReceiptNumber = orNumber,
                Remarks = dateAuditRemark,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        return (op, applicationId, appNumber, null);
    }

    private static OfficialReceipt CreateReceiptEntity(
        IssueOfficialReceiptCommand request,
        string orNumber,
        OrBooklet? booklet,
        OrderOfPayment? op,
        Guid? applicationId,
        Guid? validUserId)
    {
        var effectiveTenantId = request.TenantId != Guid.Empty
            ? request.TenantId
            : (op?.Application?.TenantId ?? booklet?.TenantId ?? Guid.Empty);

        var formattedIssueDate = request.IssueDate.HasValue
            ? request.IssueDate.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            : string.Empty;

        var dateOverrideSuffix = !string.IsNullOrWhiteSpace(request.DateChangeReason)
            ? FormattableString.Invariant($"[Date Override: {formattedIssueDate}. Reason: {request.DateChangeReason.Trim()}]")
            : null;

        var combinedRemarks = dateOverrideSuffix != null
            ? (string.IsNullOrWhiteSpace(request.Remarks)
                ? dateOverrideSuffix
                : FormattableString.Invariant($"{request.Remarks.Trim()} {dateOverrideSuffix}"))
            : request.Remarks?.Trim();

        var receipt = new OfficialReceipt
        {
            Id = Guid.NewGuid(),
            TenantId = effectiveTenantId,
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
            IssuedAt = request.IssueDate.HasValue ? DateTime.SpecifyKind(request.IssueDate.Value, DateTimeKind.Utc) : DateTime.UtcNow,
            IssuedByUserId = validUserId,
            Remarks = combinedRemarks
        };

        if (request.LineItems != null && request.LineItems.Count > 0)
        {
            foreach (var item in request.LineItems)
            {
                receipt.LineItems.Add(new OfficialReceiptLineItem
                {
                    Id = Guid.NewGuid(),
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
                Id = Guid.NewGuid(),
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

    private static void UpdateOpRemarksWithIssuedOr(
        OrderOfPayment op,
        string orNumber,
        PaymentMethod paymentMethod,
        decimal amount,
        string? checkNumber)
    {
        if (string.IsNullOrWhiteSpace(op.Remarks)) return;

        const string tagStart = "[PAYMENT_BREAKDOWN:";
        var startIdx = op.Remarks.IndexOf(tagStart, StringComparison.Ordinal);
        if (startIdx < 0) return;

        var jsonStart = startIdx + tagStart.Length;
        const string explicitEnd = ":END_PAYMENT_BREAKDOWN]";
        var explicitEndIdx = op.Remarks.IndexOf(explicitEnd, jsonStart, StringComparison.Ordinal);

        string jsonString;
        int fullEndIdx;

        if (explicitEndIdx >= 0)
        {
            jsonString = op.Remarks.Substring(jsonStart, explicitEndIdx - jsonStart).Trim();
            fullEndIdx = explicitEndIdx + explicitEnd.Length;
        }
        else
        {
            int braceCount = 0;
            bool started = false;
            int jsonEnd = -1;
            for (int i = jsonStart; i < op.Remarks.Length; i++)
            {
                if (op.Remarks[i] == '{')
                {
                    braceCount++;
                    started = true;
                }
                else if (op.Remarks[i] == '}')
                {
                    braceCount--;
                    if (started && braceCount == 0)
                    {
                        jsonEnd = i + 1;
                        break;
                    }
                }
            }

            if (jsonEnd < 0) return;
            jsonString = op.Remarks.Substring(jsonStart, jsonEnd - jsonStart).Trim();
            fullEndIdx = jsonEnd;
            if (fullEndIdx < op.Remarks.Length && op.Remarks[fullEndIdx] == ']')
            {
                fullEndIdx++;
            }
        }

        try
        {
            var node = JsonNode.Parse(jsonString);
            if (node == null) return;

            var items = node["items"]?.AsArray();
            if (items == null || items.Count == 0) return;

            var methodStr = paymentMethod.ToString();
            JsonObject? matchedItem = null;

            // 1. Try matching by mode + checkNumber/amount and not already issued
            foreach (var it in items)
            {
                if (it is JsonObject obj)
                {
                    var isIssued = obj["isIssued"]?.GetValue<bool>() ?? false;
                    if (isIssued) continue;

                    var mode = obj["mode"]?.GetValue<string>();
                    if (string.Equals(mode, methodStr, StringComparison.OrdinalIgnoreCase))
                    {
                        if (paymentMethod == PaymentMethod.Check && !string.IsNullOrWhiteSpace(checkNumber))
                        {
                            var cNum = obj["checkNumber"]?.GetValue<string>();
                            if (string.Equals(cNum, checkNumber, StringComparison.OrdinalIgnoreCase))
                            {
                                matchedItem = obj;
                                break;
                            }
                        }
                        else
                        {
                            matchedItem = obj;
                            break;
                        }
                    }
                }
            }

            // Fallback: match any unissued item with matching mode
            if (matchedItem == null)
            {
                foreach (var it in items)
                {
                    if (it is JsonObject obj)
                    {
                        var isIssued = obj["isIssued"]?.GetValue<bool>() ?? false;
                        if (!isIssued)
                        {
                            var mode = obj["mode"]?.GetValue<string>();
                            if (string.Equals(mode, methodStr, StringComparison.OrdinalIgnoreCase))
                            {
                                matchedItem = obj;
                                break;
                            }
                        }
                    }
                }
            }

            if (matchedItem != null)
            {
                matchedItem["isIssued"] = true;
                matchedItem["orNumber"] = orNumber;
                matchedItem["issuedAt"] = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);
            }

            var updatedJson = node.ToJsonString();
            var beforeTag = op.Remarks.Substring(0, startIdx);
            var afterTag = fullEndIdx < op.Remarks.Length ? op.Remarks.Substring(fullEndIdx) : string.Empty;

            op.Remarks = $"{beforeTag.TrimEnd()} {tagStart}{updatedJson}{explicitEnd}{afterTag}".Trim();
        }
        catch
        {
            // If parsing fails, leave remarks intact
        }
    }
}
