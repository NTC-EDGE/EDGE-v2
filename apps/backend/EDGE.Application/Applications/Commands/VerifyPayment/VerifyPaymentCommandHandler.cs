using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.VerifyPayment;

public class VerifyPaymentCommandHandler : IRequestHandler<VerifyPaymentCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public VerifyPaymentCommandHandler(IApplicationFullRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<bool>> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);

        if (op == null) return ApiResponse<bool>.Fail("Order of Payment not found.");
        if (op.Status != OpStatus.Processing && op.Status != OpStatus.Billed) return ApiResponse<bool>.Fail("OP is not in correct status.");

        var prevOpStatus = op.Status;
        op.Status = OpStatus.Paid;
        op.OfficialReceiptNumber = request.OfficialReceiptNumber;
        op.AmountReceived = request.AmountReceived;
        op.VerifiedByCashierId = Guid.Empty; // Current user
        op.PaidAt = DateTime.UtcNow;

        var prevAppStatus = op.Application.Status;
        op.Application.Status = ApplicationStatus.Completed;

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"Payment verified. OR: {request.OfficialReceiptNumber}",
            FromStatus = prevOpStatus,
            ToStatus = OpStatus.Paid,
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddApplicationHistoryAsync(new ApplicationHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = op.ApplicationId,
            Action = "Application completed. Payment received.",
            FromStatus = prevAppStatus,
            ToStatus = ApplicationStatus.Completed,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}
