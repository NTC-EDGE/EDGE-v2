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
            _logger.LogWarning("SubmitPayment failed. No active Order of Payment found for Application '{ApplicationId}'.", request.ApplicationId);
            return ApiResponse<bool>.Fail("No pending Order of Payment found for this application.");
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

        if (request.PaymentMethod == PaymentMethod.Check && !string.IsNullOrWhiteSpace(request.ReferenceNumber))
        {
            op.CheckNumber = request.ReferenceNumber;
        }

        var clientName = !string.IsNullOrWhiteSpace(request.PayorName)
            ? request.PayorName
            : (_currentUserService.UserId != null ? $"User {_currentUserService.UserId}" : "Applicant");

        var paymentSummary = $"Payment submitted via {request.PaymentMethod}. Ref: {request.ReferenceNumber ?? "N/A"}.";
        if (!string.IsNullOrWhiteSpace(request.Remarks))
        {
            paymentSummary += $" Notes: {request.Remarks}";
        }

        op.Remarks = paymentSummary;

        var clientGuid = Guid.TryParse(_currentUserService.UserId, out var parsedGuid) ? parsedGuid : (Guid?)null;

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"Client submitted payment via {request.PaymentMethod} (Ref: {request.ReferenceNumber ?? "N/A"}). Awaiting Cashier verification.",
            FromStatus = prevOpStatus,
            ToStatus = OpStatus.Processing,
            PerformedByUserId = clientGuid,
            StaffName = clientName,
            StaffRole = "Client",
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddApplicationHistoryAsync(new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            Action = $"Payment submitted by client via {request.PaymentMethod} (Ref: {request.ReferenceNumber ?? "N/A"}). Forwarded to Cashier for verification.",
            FromStatus = app.Status,
            ToStatus = app.Status,
            PerformedByUserId = clientGuid,
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
}
