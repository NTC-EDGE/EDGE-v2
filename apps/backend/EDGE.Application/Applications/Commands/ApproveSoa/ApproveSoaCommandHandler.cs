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

    public ApproveSoaCommandHandler(
        IApplicationFullRepository repository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<Guid>> Handle(ApproveSoaCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);

        if (soa == null) return ApiResponse<Guid>.Fail("SOA not found.");
        if (soa.Status != SoaStatus.Pending) return ApiResponse<Guid>.Fail("SOA must be Pending to approve.");

        Guid? actingUserId = null;
        var currentUserIdStr = _currentUserService.UserId;
        if (!string.IsNullOrEmpty(currentUserIdStr) && Guid.TryParse(currentUserIdStr, out var parsedUserId))
        {
            if (await _repository.UserExistsAsync(parsedUserId, cancellationToken))
            {
                actingUserId = parsedUserId;
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
            Timestamp = DateTime.UtcNow
        });

        op.Histories.Add(new OpHistory
        {
            Id = Guid.NewGuid(),
            OrderOfPaymentId = op.Id,
            Action = "Order of Payment issued.",
            ToStatus = OpStatus.Billed,
            Timestamp = DateTime.UtcNow
        });

        await _repository.AddOpAsync(op, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(op.Id);
    }
}
