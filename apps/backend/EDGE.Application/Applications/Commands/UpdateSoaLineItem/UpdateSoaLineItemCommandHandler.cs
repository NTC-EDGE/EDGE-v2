using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.UpdateSoaLineItem;

public class UpdateSoaLineItemCommandHandler : IRequestHandler<UpdateSoaLineItemCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public UpdateSoaLineItemCommandHandler(
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

    public async Task<ApiResponse<Guid>> Handle(UpdateSoaLineItemCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);
        if (soa == null)
        {
            return ApiResponse<Guid>.Fail("Statement of Account not found.");
        }

        var item = soa.LineItems.FirstOrDefault(li => li.Id == request.LineItemId);
        if (item == null)
        {
            return ApiResponse<Guid>.Fail("SOA Line Item not found.");
        }

        var oldAmount = item.Amount;
        var newAmount = request.Amount.HasValue && request.Amount.Value > 0
            ? request.Amount.Value
            : request.NoOfUnits * request.FeeRate;

        item.Particular = request.Particular;
        item.ItemCode = request.ItemCode;
        item.Description = request.Description;
        item.PeriodOfCoverageStart = request.PeriodOfCoverageStart.HasValue
            ? DateTime.SpecifyKind(request.PeriodOfCoverageStart.Value, DateTimeKind.Utc)
            : null;
        item.PeriodOfCoverageEnd = request.PeriodOfCoverageEnd.HasValue
            ? DateTime.SpecifyKind(request.PeriodOfCoverageEnd.Value, DateTimeKind.Utc)
            : null;
        item.ValidityYears = request.ValidityYears;
        item.NoOfUnits = request.NoOfUnits;
        item.FeeRate = request.FeeRate;
        item.Amount = newAmount;

        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Staff", cancellationToken);

        var history = new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"Line item '{request.Particular}' updated from ₱{oldAmount:N2} to ₱{newAmount:N2}",
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
        return ApiResponse<Guid>.Success(item.Id, "Line item updated successfully.");
    }
}
