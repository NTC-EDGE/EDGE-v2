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

        Guid? actingUserId = null;
        string staffName = "Accountant";
        string staffRole = "Accountant";

        var currentUserIdStr = _currentUserService.UserId;
        if (!string.IsNullOrEmpty(currentUserIdStr) && Guid.TryParse(currentUserIdStr, out var parsedUserId))
        {
            var user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            if (user != null)
            {
                actingUserId = user.Id;
                staffName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(staffName)) staffName = user.Email;
            }
        }

        soa.Status = SoaStatus.Returned;
        soa.Remarks = request.Remarks;

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"SOA returned. Reason: {request.Remarks}",
            FromStatus = SoaStatus.Pending,
            ToStatus = SoaStatus.Returned,
            PerformedByUserId = actingUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        });

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<bool>.Success(true);
    }
}
