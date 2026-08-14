using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.UpdateSoa;

public class UpdateSoaCommandHandler : IRequestHandler<UpdateSoaCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public UpdateSoaCommandHandler(
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

    public async Task<ApiResponse<Guid>> Handle(UpdateSoaCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);
        if (soa == null)
        {
            return ApiResponse<Guid>.Fail("Statement of Account not found.");
        }

        if (request.DueDate.HasValue)
        {
            soa.DueDate = DateTime.SpecifyKind(request.DueDate.Value, DateTimeKind.Utc);
        }

        if (!string.IsNullOrWhiteSpace(request.IssuedToName))
        {
            soa.IssuedToName = request.IssuedToName;
        }

        if (request.IssuedToAddress != null)
        {
            soa.IssuedToAddress = request.IssuedToAddress;
        }

        if (request.Remarks != null)
        {
            soa.Remarks = request.Remarks;
        }

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Staff", cancellationToken);

        var history = new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = "Statement of Account details updated",
            FromStatus = soa.Status,
            ToStatus = soa.Status,
            PerformedByUserId = userContext.UserId,
            StaffName = userContext.StaffName,
            StaffRole = userContext.StaffRole,
            Timestamp = DateTime.UtcNow
        };

        await _repository.AddSoaHistoryAsync(history, cancellationToken);
        soa.Histories.Add(history);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(soa.Id, "Statement of Account updated successfully.");
    }
}
