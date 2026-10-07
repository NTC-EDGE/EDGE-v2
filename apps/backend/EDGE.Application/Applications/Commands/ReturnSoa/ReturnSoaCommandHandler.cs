using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.ReturnSoa;

public class ReturnSoaCommandHandler : IRequestHandler<ReturnSoaCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public ReturnSoaCommandHandler(
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

    public async Task<ApiResponse<bool>> Handle(ReturnSoaCommand request, CancellationToken cancellationToken)
    {
        StatementOfAccount? soa = null;
        if (request.SoaId.HasValue && request.SoaId.Value != Guid.Empty)
        {
            soa = await _repository.GetSoaByIdAsync(request.SoaId.Value, cancellationToken);
        }

        if (soa == null)
        {
            var targetAppId = (request.ApplicationId.HasValue && request.ApplicationId.Value != Guid.Empty)
                ? request.ApplicationId.Value
                : (request.SoaId.HasValue && request.SoaId.Value != Guid.Empty ? request.SoaId.Value : Guid.Empty);

            if (targetAppId != Guid.Empty)
            {
                var appLoaded = await _repository.GetByIdWithDetailsAsync(targetAppId, cancellationToken);
                if (appLoaded != null)
                {
                    soa = appLoaded.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault(s => s.Status == SoaStatus.Pending)
                          ?? appLoaded.StatementsOfAccount.OrderByDescending(s => s.CreatedAt).FirstOrDefault();
                    if (soa != null && soa.Application == null)
                    {
                        soa.Application = appLoaded;
                    }
                }
            }
        }

        if (soa == null) return ApiResponse<bool>.Fail("Statement of Account (SOA) not found for this return request.");
        if (soa.Status != SoaStatus.Pending && soa.Status != SoaStatus.Approved)
        {
            return ApiResponse<bool>.Fail("SOA must be in Pending or Approved status to return.");
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Accountant", cancellationToken);
        Guid? validUserId = null;
        if (userContext.UserId.HasValue && await _repository.UserExistsAsync(userContext.UserId.Value, cancellationToken))
        {
            validUserId = userContext.UserId.Value;
        }

        var staffName = !string.IsNullOrWhiteSpace(userContext.StaffName) ? userContext.StaffName : "Accountant";
        var staffRole = !string.IsNullOrWhiteSpace(userContext.StaffRole) ? userContext.StaffRole : "Accountant";

        var prevSoaStatus = soa.Status;
        soa.Status = SoaStatus.Returned;
        soa.Remarks = request.Remarks;

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"SOA returned. Reason: {request.Remarks}",
            FromStatus = prevSoaStatus,
            ToStatus = SoaStatus.Returned,
            PerformedByUserId = validUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        });

        var app = soa.Application ?? await _repository.GetByIdAsync(soa.ApplicationId, cancellationToken);
        if (app != null)
        {
            var prevAppStatus = app.Status;
            app.Status = ApplicationStatus.Returned;
            app.Remarks = $"SOA returned by Accountant: {request.Remarks}";
            await _repository.UpdateAsync(app, cancellationToken);

            await _repository.AddApplicationStatusHistoryAsync(new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Status = ApplicationStatus.Returned,
                Remarks = $"SOA returned by Accountant: {request.Remarks}",
                Timestamp = DateTime.UtcNow,
                UserId = validUserId
            }, cancellationToken);

            await _repository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = "SOA Returned to Evaluator",
                FromStatus = prevAppStatus,
                ToStatus = ApplicationStatus.Returned,
                PerformedByUserId = validUserId,
                StaffName = staffName,
                StaffRole = staffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}
