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
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);

        if (soa == null) return ApiResponse<bool>.Fail("SOA not found.");
        if (soa.Status != SoaStatus.Pending) return ApiResponse<bool>.Fail("SOA must be Pending to return.");

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Accountant", cancellationToken);

        soa.Status = SoaStatus.Returned;
        soa.Remarks = request.Remarks;

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"SOA returned. Reason: {request.Remarks}",
            FromStatus = SoaStatus.Pending,
            ToStatus = SoaStatus.Returned,
            PerformedByUserId = userContext.UserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        });

        var app = await _repository.GetByIdAsync(soa.ApplicationId, cancellationToken);
        if (app != null && app.Status == ApplicationStatus.ForAccountant)
        {
            app.Status = ApplicationStatus.Evaluating;
            app.Remarks = $"SOA returned by Accountant: {request.Remarks}";
            await _repository.UpdateAsync(app, cancellationToken);

            await _repository.AddApplicationStatusHistoryAsync(new ApplicationStatusHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Status = ApplicationStatus.Evaluating,
                Remarks = $"SOA returned by Accountant: {request.Remarks}",
                Timestamp = DateTime.UtcNow,
                UserId = userContext.UserId
            }, cancellationToken);

            await _repository.AddApplicationHistoryAsync(new ApplicationHistory
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Action = "SOA Returned to Evaluator",
                ToStatus = ApplicationStatus.Evaluating,
                PerformedByUserId = userContext.UserId,
                StaffName = userContext.StaffName,
                StaffRole = userContext.StaffRole,
                Remarks = request.Remarks,
                Timestamp = DateTime.UtcNow
            }, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}
