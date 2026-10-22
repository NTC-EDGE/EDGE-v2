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
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public VerifyPaymentCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<bool>> Handle(VerifyPaymentCommand request, CancellationToken cancellationToken)
    {
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);

        if (op == null) return ApiResponse<bool>.Fail("Order of Payment not found.");
        if (op.Status != OpStatus.Processing && op.Status != OpStatus.Billed) return ApiResponse<bool>.Fail("OP is not in correct status.");

        // Validate OP Payment Amount: Ensure AmountReceived >= AmountDue before completing application
        if (request.AmountReceived < op.AmountDue)
        {
            return ApiResponse<bool>.Fail($"Amount received ({request.AmountReceived:F2}) is less than the required amount due ({op.AmountDue:F2}).");
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        var prevOpStatus = op.Status;
        op.Status = OpStatus.Paid;
        op.OfficialReceiptNumber = request.OfficialReceiptNumber;
        op.AmountReceived = request.AmountReceived;
        op.VerifiedByCashierId = validUserId;
        op.PaidAt = DateTime.UtcNow;

        if (op.Application != null)
        {
            var prevAppStatus = op.Application.Status;
            op.Application.Status = ApplicationStatus.ForIssuance;

            await _repository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = op.ApplicationId,
                Action = $"Payment verified. OR: {request.OfficialReceiptNumber}. Forwarded for Document & License Issuance.",
                FromStatus = prevAppStatus,
                ToStatus = ApplicationStatus.ForIssuance,
                PerformedByUserId = validUserId,
                StaffName = userContext.StaffName,
                StaffRole = userContext.StaffRole,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _repository.AddOpHistoryAsync(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"Payment verified. OR: {request.OfficialReceiptNumber}",
            FromStatus = prevOpStatus,
            ToStatus = OpStatus.Paid,
            PerformedByUserId = validUserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            OfficialReceiptNumber = request.OfficialReceiptNumber,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}
