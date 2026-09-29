using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Commands.Booklets.TransferOrBooklet;

public record TransferOrBookletCommand(
    Guid Id,
    Guid TenantId,
    Guid NewAssignedUserId,
    List<Guid>? AdditionalUserIds = null,
    string? TransferReason = null
) : IRequest<ApiResponse<OrBookletDto>>;

public class TransferOrBookletCommandValidator : AbstractValidator<TransferOrBookletCommand>
{
    public TransferOrBookletCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Booklet Id is required.");
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.NewAssignedUserId).NotEmpty().WithMessage("New Assigned User Id is required.");
    }
}

public class TransferOrBookletCommandHandler : IRequestHandler<TransferOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TransferOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(TransferOrBookletCommand request, CancellationToken cancellationToken)
    {
        var booklet = await _bookletRepository.GetByIdAsync(request.Id, cancellationToken);
        if (booklet == null || booklet.TenantId != request.TenantId)
        {
            return ApiResponse<OrBookletDto>.Fail("OR Booklet was not found.");
        }

        var newUser = await _userRepository.GetByIdAsync(request.NewAssignedUserId, cancellationToken);
        if (newUser == null)
        {
            return ApiResponse<OrBookletDto>.Fail("Target cashier / staff user was not found.");
        }

        // Verify that the new assignee belongs to this tenant
        var membership = await _tenantMemberRepository.GetByTenantAndUserAsync(request.TenantId, request.NewAssignedUserId, cancellationToken);
        if (membership == null && !newUser.IsSuperAdmin)
        {
            return ApiResponse<OrBookletDto>.Fail("The new custodian must belong to this regional office / tenant.");
        }

        var newUserName = $"{newUser.FirstName} {newUser.LastName}".Trim();
        booklet.AssignedUserId = request.NewAssignedUserId;

        // Collect all users to assign
        var allUserIds = new List<Guid> { request.NewAssignedUserId };
        if (request.AdditionalUserIds != null)
        {
            foreach (var uid in request.AdditionalUserIds.Where(id => id != Guid.Empty && id != request.NewAssignedUserId).Distinct())
            {
                allUserIds.Add(uid);
            }
        }

        booklet.AssignedCashiers.Clear();
        foreach (var uid in allUserIds)
        {
            var u = await _userRepository.GetByIdAsync(uid, cancellationToken);
            if (u == null)
            {
                return ApiResponse<OrBookletDto>.Fail($"Cashier user '{uid}' was not found.");
            }

            var mem = await _tenantMemberRepository.GetByTenantAndUserAsync(request.TenantId, uid, cancellationToken);
            if (mem == null && !u.IsSuperAdmin)
            {
                return ApiResponse<OrBookletDto>.Fail($"Cashier '{u.FirstName} {u.LastName}' must belong to this regional office / tenant.");
            }

            if (!EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet.CreateOrBookletCommandHandler.IsAuthorizedCashierRole(u, mem))
            {
                var roleDisplayName = mem?.Role?.Name ?? mem?.Position ?? "User";
                return ApiResponse<OrBookletDto>.Fail($"User '{u.FirstName} {u.LastName}' has the role '{roleDisplayName}' and is not authorized to hold Official Receipt booklets. Only Cashiers can be assigned.");
            }

            booklet.AssignedCashiers.Add(new OrBookletCashier
            {
                BookletId = booklet.Id,
                CashierUserId = uid,
                IsPrimary = uid == request.NewAssignedUserId,
                AssignedAt = DateTime.UtcNow
            });
        }

        if (!string.IsNullOrWhiteSpace(request.TransferReason))
        {
            var auditLog = $"[Transferred to {newUserName} on {DateTime.UtcNow:yyyy-MM-dd HH:mm}: {request.TransferReason.Trim()}]";
            booklet.Remarks = string.IsNullOrWhiteSpace(booklet.Remarks)
                ? auditLog
                : $"{booklet.Remarks}\n{auditLog}";
        }

        await _bookletRepository.UpdateAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var assignedCashiers = booklet.AssignedCashiers.Select(ac => new BookletCashierDto(
            ac.CashierUserId,
            ac.CashierUser != null ? $"{ac.CashierUser.FirstName} {ac.CashierUser.LastName}".Trim() : (ac.CashierUserId == request.NewAssignedUserId ? newUserName : string.Empty),
            ac.IsPrimary
        )).ToList();

        var cashierDisplayNames = assignedCashiers.Select(c => c.FullName).ToList();
        var cashierIds = assignedCashiers.Select(c => c.UserId).ToList();

        var dto = new OrBookletDto(
            booklet.Id,
            booklet.TenantId,
            booklet.BookletNumber,
            booklet.Prefix,
            booklet.StartNumber,
            booklet.EndNumber,
            booklet.CurrentNumber,
            booklet.TotalCount,
            booklet.IssuedCount,
            booklet.RemainingCount,
            booklet.FormatOrNumber(booklet.StartNumber),
            booklet.FormatOrNumber(booklet.EndNumber),
            booklet.CurrentFormattedOrNumber,
            booklet.AssignedUserId,
            newUserName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks,
            cashierIds,
            cashierDisplayNames,
            assignedCashiers
        );

        return ApiResponse<OrBookletDto>.Success(dto, $"Official Receipt booklet successfully transferred to {newUserName}.");
    }
}
