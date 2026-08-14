using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.DeleteSoaLineItem;

public class DeleteSoaLineItemCommandHandler : IRequestHandler<DeleteSoaLineItemCommand, ApiResponse<bool>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public DeleteSoaLineItemCommandHandler(
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

    public async Task<ApiResponse<bool>> Handle(DeleteSoaLineItemCommand request, CancellationToken cancellationToken)
    {
        var soa = await _repository.GetSoaByIdAsync(request.SoaId, cancellationToken);
        if (soa == null)
        {
            return ApiResponse<bool>.Fail("Statement of Account not found.");
        }

        var item = soa.LineItems.FirstOrDefault(li => li.Id == request.LineItemId);
        if (item == null)
        {
            return ApiResponse<bool>.Fail("SOA Line Item not found.");
        }

        var removedParticular = item.Particular;
        var removedAmount = item.Amount;

        _repository.RemoveSoaLineItem(item);
        soa.LineItems.Remove(item);
        soa.TotalAmount = soa.LineItems.Sum(li => li.Amount);

        var userContext = await _userRepository.GetStaffUserContextAsync(_currentUserService.UserId, "Staff", cancellationToken);

        var history = new SoaHistory
        {
            Id = Guid.NewGuid(),
            StatementOfAccountId = soa.Id,
            Action = $"Line item '{removedParticular}' (Amount: ₱{removedAmount:N2}) removed",
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
        return ApiResponse<bool>.Success(true, "Line item removed successfully.");
    }
}
