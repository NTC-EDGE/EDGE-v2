using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.AddSoaLineItem;

public class AddSoaLineItemCommandHandler : IRequestHandler<AddSoaLineItemCommand, ApiResponse<Guid>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public AddSoaLineItemCommandHandler(
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

    public async Task<ApiResponse<Guid>> Handle(AddSoaLineItemCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);
        if (soa == null)
        {
            return ApiResponse<Guid>.Fail("Statement of Account not found.");
        }

        var calculatedAmount = request.NoOfUnits * request.FeeRate;
        var lineItem = new SoaLineItem
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Particular = request.Particular,
            ItemCode = request.ItemCode,
            Description = request.Description,
            PeriodOfCoverageStart = request.PeriodOfCoverageStart.HasValue
                ? DateTime.SpecifyKind(request.PeriodOfCoverageStart.Value, DateTimeKind.Utc)
                : null,
            PeriodOfCoverageEnd = request.PeriodOfCoverageEnd.HasValue
                ? DateTime.SpecifyKind(request.PeriodOfCoverageEnd.Value, DateTimeKind.Utc)
                : null,
            ValidityYears = request.ValidityYears,
            NoOfUnits = request.NoOfUnits,
            FeeRate = request.FeeRate,
            Amount = calculatedAmount
        };

        await _repository.AddSoaLineItemAsync(lineItem, cancellationToken);
        soa.LineItems.Add(lineItem);
        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Staff", cancellationToken);

        var history = new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"Line item '{request.Particular}' added (Amount: ₱{calculatedAmount:N2})",
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
        return ApiResponse<Guid>.Success(lineItem.Id, "Line item added successfully.");
    }
}
