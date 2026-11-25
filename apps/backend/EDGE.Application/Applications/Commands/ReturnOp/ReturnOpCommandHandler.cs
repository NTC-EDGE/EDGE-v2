using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.ReturnOp;

public class ReturnOpCommandHandler : IRequestHandler<ReturnOpCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IApplicationEmailNotificationService? _emailNotificationService;

    public ReturnOpCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IApplicationEmailNotificationService? emailNotificationService = null)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _emailNotificationService = emailNotificationService;
    }

    public async Task<ApiResponse<bool>> Handle(ReturnOpCommand request, CancellationToken cancellationToken)
    {
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);

        if (op == null) return ApiResponse<bool>.Fail("Order of Payment not found.");

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Cashier", cancellationToken);

        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        op.Status = OpStatus.Returned;
        op.Remarks = request.Remarks;
        op.AmountReceived = 0;
        op.PaymentMethod = null;
        op.CheckNumber = null;
        op.CheckBank = null;
        op.CheckDate = null;
        op.PaidAt = null;
        op.OfficialReceiptNumber = null;

        await _repository.AddOpHistoryAsync(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"OP returned to {request.ReturnTo}. Reason: {request.Remarks}",
            ToStatus = OpStatus.Returned,
            PerformedByUserId = validUserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);

        if (op.StatementOfAccount != null)
        {
            var soa = op.StatementOfAccount;
            var prevSoaStatus = soa.Status;
            var nextSoaStatus = request.ReturnTo == ReturnTarget.Accountant
                ? SoaStatus.ForOrderOfPayment
                : SoaStatus.Returned;
            soa.Status = nextSoaStatus;

            await _repository.AddSoaHistoryAsync(new SoaHistory
            {
                Id = Guid.NewGuid(),
                StatementOfAccountId = soa.Id,
                Action = $"SOA returned along with OP to {request.ReturnTo}. Reason: {request.Remarks}",
                FromStatus = prevSoaStatus,
                ToStatus = nextSoaStatus,
                PerformedByUserId = validUserId,
                StaffName = userContext.StaffName,
                StaffRole = userContext.StaffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        var app = await _repository.GetByIdAsync(op.ApplicationId, cancellationToken);
        if (app != null)
        {
            var targetAppStatus = request.ReturnTo switch
            {
                ReturnTarget.Accountant => ApplicationStatus.ForAccountant,
                ReturnTarget.Supervisor => ApplicationStatus.Evaluating,
                _ => ApplicationStatus.Returned
            };

            var actionName = request.ReturnTo switch
            {
                ReturnTarget.Accountant => "OP Returned to Accountant",
                ReturnTarget.Supervisor => "OP Endorsed to Supervisor",
                _ => "OP Returned to Evaluator"
            };

            app.Status = targetAppStatus;
            app.Remarks = $"Order of Payment returned by Cashier: {request.Remarks}";
            await _repository.UpdateAsync(app, cancellationToken);

            await _repository.AddApplicationStatusHistoryAsync(new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Status = targetAppStatus,
                Remarks = $"Order of Payment returned by Cashier: {request.Remarks}",
                Timestamp = DateTime.UtcNow,
                UserId = validUserId
            }, cancellationToken);

            await _repository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = actionName,
                ToStatus = targetAppStatus,
                PerformedByUserId = validUserId,
                StaffName = userContext.StaffName,
                StaffRole = userContext.StaffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        if (_emailNotificationService != null && app != null && app.Status == ApplicationStatus.Returned)
        {
            await _emailNotificationService.SendApplicationReturnedForComplianceAsync(app.Id, request.Remarks, cancellationToken);
        }

        return ApiResponse<bool>.Success(true);
    }
}
