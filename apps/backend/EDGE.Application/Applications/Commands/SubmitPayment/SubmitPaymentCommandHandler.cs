using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.SubmitPayment;

public class SubmitPaymentCommandHandler : IRequestHandler<SubmitPaymentCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<SubmitPaymentCommandHandler> _logger;

    public SubmitPaymentCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        ILogger<SubmitPaymentCommandHandler> logger)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<bool>> Handle(SubmitPaymentCommand request, CancellationToken cancellationToken)
    {
        var app = await _repository.GetByIdWithDetailsAsync(request.ApplicationId, cancellationToken);
        if (app == null)
        {
            _logger.LogWarning("SubmitPayment failed. Application '{ApplicationId}' not found.", request.ApplicationId);
            return ApiResponse<bool>.Fail("Application not found.");
        }

        if (app.Status != ApplicationStatus.PendingPayment)
        {
            _logger.LogWarning("SubmitPayment failed. Application '{ApplicationId}' status is '{Status}', expected 'PendingPayment'.", request.ApplicationId, app.Status);
            return ApiResponse<bool>.Fail($"Application is currently '{app.Status}'. Payment can only be submitted when in 'PendingPayment' status.");
        }

        OrderOfPayment? op = null;
        if (request.OrderOfPaymentId.HasValue)
        {
            op = app.OrdersOfPayment.FirstOrDefault(o => o.Id == request.OrderOfPaymentId.Value);
        }

        if (op == null)
        {
            op = app.OrdersOfPayment
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefault(o => o.Status == OpStatus.Billed || o.Status == OpStatus.Processing);
        }

        if (op == null)
        {
            op = app.OrdersOfPayment
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefault(o => o.Status != OpStatus.Paid);
        }

        if (op == null)
        {
            var latestSoa = app.StatementsOfAccount
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault();

            var amountDue = request.AmountPaid ?? latestSoa?.TotalAmount ?? 0m;
            if (amountDue <= 0 && latestSoa != null && latestSoa.LineItems != null)
            {
                amountDue = latestSoa.LineItems.Sum(li => li.Amount);
            }

            op = new OrderOfPayment
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                StatementOfAccountId = latestSoa?.Id ?? Guid.NewGuid(),
                OpNumber = $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                AmountDue = amountDue > 0 ? amountDue : 1000.00m,
                AmountReceived = request.AmountPaid ?? (amountDue > 0 ? amountDue : 1000.00m),
                Status = OpStatus.Billed,
                PaymentMethod = request.PaymentMethod,
                CreatedAt = DateTime.UtcNow
            };

            await _repository.AddOpAsync(op, cancellationToken);
            app.OrdersOfPayment.Add(op);
        }

        var prevOpStatus = op.Status;
        op.Status = OpStatus.Processing;
        op.PaymentMethod = request.PaymentMethod;
        
        if (request.AmountPaid.HasValue && request.AmountPaid.Value > 0)
        {
            op.AmountReceived = request.AmountPaid.Value;
        }
        else
        {
            op.AmountReceived = op.AmountDue;
        }

        if (request.PaymentMethod == PaymentMethod.Check)
        {
            if (!string.IsNullOrWhiteSpace(request.CheckNumber))
            {
                op.CheckNumber = request.CheckNumber.Trim();
            }
            else if (!string.IsNullOrWhiteSpace(request.ReferenceNumber))
            {
                op.CheckNumber = request.ReferenceNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.CheckBank))
            {
                op.CheckBank = request.CheckBank.Trim();
            }

            if (request.CheckDate.HasValue)
            {
                op.CheckDate = DateTime.SpecifyKind(request.CheckDate.Value, DateTimeKind.Utc);
            }
        }

        // Also check if remarks contains serialized breakdown with check details (e.g. combination or single check)
        if (string.IsNullOrWhiteSpace(op.CheckBank) || string.IsNullOrWhiteSpace(op.CheckNumber))
        {
            TryExtractCheckDetailsFromRemarks(request.Remarks, op);
        }

        var clientName = !string.IsNullOrWhiteSpace(request.PayorName)
            ? request.PayorName
            : (_currentUserService.UserId != null ? $"User {_currentUserService.UserId}" : "Applicant");

        var checkDetailStr = !string.IsNullOrWhiteSpace(op.CheckBank)
            ? $"Bank: {op.CheckBank}, Check #: {op.CheckNumber ?? request.ReferenceNumber ?? "N/A"}"
            : $"Check #: {op.CheckNumber ?? request.ReferenceNumber ?? "N/A"}";

        var paymentSummary = request.PaymentMethod == PaymentMethod.Check
            ? $"Payment submitted via Check ({checkDetailStr})."
            : $"Payment submitted via {request.PaymentMethod}. Ref: {request.ReferenceNumber ?? "N/A"}.";

        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            paymentSummary += $" Notes: {request.Remarks}";
        }

        op.Remarks = paymentSummary;

        var clientGuid = Guid.TryParse(_currentUserService.UserId, out var parsedGuid) ? parsedGuid : (Guid?)null;
        Guid? validUserId = null;
        if (clientGuid.HasValue && await _repository.UserExistsAsync(clientGuid.Value, cancellationToken))
        {
            validUserId = clientGuid.Value;
        }

        var historyAction = request.PaymentMethod == PaymentMethod.Check
            ? $"Client submitted payment via Check ({checkDetailStr}). Awaiting Cashier verification."
            : $"Client submitted payment via {request.PaymentMethod} (Ref: {request.ReferenceNumber ?? "N/A"}). Awaiting Cashier verification.";

        await _repository.AddOpHistoryAsync(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = historyAction,
            FromStatus = prevOpStatus,
            ToStatus = OpStatus.Processing,
            PerformedByUserId = validUserId,
            StaffName = clientName,
            StaffRole = "Client",
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        await _repository.AddApplicationHistoryAsync(new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = historyAction,
            FromStatus = app.Status,
            ToStatus = app.Status,
            PerformedByUserId = validUserId,
            StaffName = clientName,
            StaffRole = "Client",
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        app.Remarks = paymentSummary;
        await _repository.UpdateAsync(app, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Payment submitted successfully for Application '{ApplicationId}' and OP '{OpId}'. Reference: '{RefNumber}'.", app.Id, op.Id, request.ReferenceNumber);

        return ApiResponse<bool>.Success(true, "Payment details submitted successfully. Your transaction is now awaiting Cashier verification.");
    }

    private static void TryExtractCheckDetailsFromRemarks(string? remarks, OrderOfPayment op)
    {
        if (string.IsNullOrWhiteSpace(remarks)) return;
        const string tagStart = "[PAYMENT_BREAKDOWN:";
        var startIdx = remarks.IndexOf(tagStart, StringComparison.Ordinal);
        if (startIdx < 0) return;
        var jsonStart = startIdx + tagStart.Length;
        var endIdx = remarks.IndexOf(']', jsonStart);
        if (endIdx < 0) return;
        var json = remarks.Substring(jsonStart, endIdx - jsonStart);
        try
        {
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("items", out var itemsElem) && itemsElem.ValueKind == System.Text.Json.JsonValueKind.Array)
            {
                foreach (var item in itemsElem.EnumerateArray())
                {
                    if (item.TryGetProperty("mode", out var modeElem) && modeElem.GetString() == "Check")
                    {
                        if (string.IsNullOrWhiteSpace(op.CheckNumber) && item.TryGetProperty("checkNumber", out var numElem))
                        {
                            op.CheckNumber = numElem.GetString()?.Trim();
                        }
                        if (string.IsNullOrWhiteSpace(op.CheckBank) && item.TryGetProperty("checkBank", out var bankElem))
                        {
                            op.CheckBank = bankElem.GetString()?.Trim();
                        }
                        if (!op.CheckDate.HasValue && item.TryGetProperty("checkDate", out var dateElem))
                        {
                            var dateStr = dateElem.GetString();
                            if (!string.IsNullOrWhiteSpace(dateStr) && DateTime.TryParse(dateStr, out var parsedDate))
                            {
                                op.CheckDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                            }
                        }
                        break;
                    }
                }
            }
        }
        catch
        {
            // Ignore parsing error and fallback gracefully
        }
    }
}
