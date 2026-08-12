using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.ApproveSoa;

public class ApproveSoaCommandHandler : IRequestHandler<ApproveSoaCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public ApproveSoaCommandHandler(
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

    public async Task<ApiResponse<Guid>> Handle(ApproveSoaCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);

        if (soa == null) return ApiResponse<Guid>.Fail("SOA not found.");
        if (soa.Status != SoaStatus.Pending) return ApiResponse<Guid>.Fail("SOA must be Pending to approve.");

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

                var memberRole = user.TenantMemberships.FirstOrDefault()?.Role?.Name 
                              ?? user.TenantMemberships.FirstOrDefault()?.Position;
                if (!string.IsNullOrWhiteSpace(memberRole))
                {
                    staffRole = memberRole;
                }
            }
        }

        soa.Status = SoaStatus.Approved;
        soa.ApprovedByUserId = actingUserId;
        soa.ApprovedAt = DateTime.UtcNow;

        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = soa.ApplicationId,
            StatementOfAccountId = soa.Id,
            OpNumber = $"OP-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
            AmountDue = soa.TotalAmount,
            Status = OpStatus.Billed
        };

        soa.Histories.Add(new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = "SOA approved by Accountant. Order of Payment generated.",
            FromStatus = SoaStatus.Pending,
            ToStatus = SoaStatus.Approved,
            PerformedByUserId = actingUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Remarks = request.Remarks,
            Timestamp = DateTime.UtcNow
        });

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = "Order of Payment issued.",
            ToStatus = OpStatus.Billed,
            PerformedByUserId = actingUserId,
            StaffName = staffName,
            StaffRole = staffRole,
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddOpAsync(op, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(op.Id);
    }
}
