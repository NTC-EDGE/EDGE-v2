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

    public ReturnOpCommandHandler(
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

    public async Task<ApiResponse<bool>> Handle(ReturnOpCommand request, CancellationToken cancellationToken)
    {
        var op = await _repository.GetOpByIdAsync(request.OpId, cancellationToken);

        if (op == null) return ApiResponse<bool>.Fail("Order of Payment not found.");

        Guid? actingUserId = null;
        string staffName = "Cashier";
        string staffRole = "Cashier";

        var currentUserIdStr = _currentUserService.UserId;
        if (!string.IsNullOrEmpty(currentUserIdStr) && Guid.TryParse(currentUserIdStr, out var parsedUserId))
        {
            var user = await _userRepository.GetByIdAsync(parsedUserId, cancellationToken);
            if (user != null)
            {
                actingUserId = user.Id;
                staffName = $"{user.FirstName} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(staffName)) staffName = user.Email;

                var memberRole = user.TenantMemberships.FirstOrDefault()?.Role?.Name 
                              ?? user.TenantMemberships.FirstOrDefault()?.Position;
                if (!string.IsNullOrWhiteSpace(memberRole))
                {
                    staffRole = memberRole;
                }
            }
        }

        op.Status = OpStatus.Returned;
        op.Remarks = request.Remarks;

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = $"OP returned to {request.ReturnTo}. Reason: {request.Remarks}",
            ToStatus = OpStatus.Returned,
            PerformedByUserId = actingUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        });

        if (request.ReturnTo == ReturnTarget.Evaluator && op.StatementOfAccount != null)
        {
            var soa = op.StatementOfAccount;
            var prevSoaStatus = soa.Status;
            soa.Status = SoaStatus.Returned;
            
            await _repository.AddSoaHistoryAsync(new SoaHistory
            {
                Id = Guid.NewGuid(),
                StatementOfAccountId = soa.Id,
                Action = $"SOA returned along with OP. Reason: {request.Remarks}",
                FromStatus = prevSoaStatus,
                ToStatus = SoaStatus.Returned,
                PerformedByUserId = actingUserId,
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
