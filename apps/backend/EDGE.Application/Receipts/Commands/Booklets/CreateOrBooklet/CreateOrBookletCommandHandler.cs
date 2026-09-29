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

namespace EDGE.Application.Receipts.Commands.Booklets.CreateOrBooklet;

public record CreateOrBookletCommand(
    Guid TenantId,
    string BookletNumber,
    string? Prefix,
    long StartNumber,
    long? EndNumber = null,
    int TotalCount = 50,
    Guid? AssignedUserId = null,
    List<Guid>? AssignedUserIds = null,
    string? Remarks = null
) : IRequest<ApiResponse<OrBookletDto>>;

public class CreateOrBookletCommandValidator : AbstractValidator<CreateOrBookletCommand>
{
    public CreateOrBookletCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("TenantId is required.");
        RuleFor(x => x.BookletNumber).NotEmpty().MaximumLength(100).WithMessage("Booklet number is required.");
        RuleFor(x => x.StartNumber).GreaterThan(0).WithMessage("Start number must be greater than 0.");
        RuleFor(x => x.TotalCount).GreaterThan(0).WithMessage("Total count must be greater than 0.");
    }
}

public class CreateOrBookletCommandHandler : IRequestHandler<CreateOrBookletCommand, ApiResponse<OrBookletDto>>
{
    private readonly IOrBookletRepository _bookletRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrBookletCommandHandler(
        IOrBookletRepository bookletRepository,
        IUserRepository userRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _bookletRepository = bookletRepository;
        _userRepository = userRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<OrBookletDto>> Handle(CreateOrBookletCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<OrBookletDto>.Fail($"Tenant '{request.TenantId}' was not found.");
        }

        var exists = await _bookletRepository.ExistsBookletNumberAsync(request.TenantId, request.BookletNumber.Trim(), null, cancellationToken);
        if (exists)
        {
            return ApiResponse<OrBookletDto>.Fail($"An Official Receipt booklet with number '{request.BookletNumber}' already exists for this tenant.");
        }

        var totalCount = request.TotalCount > 0 ? request.TotalCount : 50;
        var endNumber = request.EndNumber ?? (request.StartNumber + totalCount - 1);

        if (endNumber < request.StartNumber)
        {
            return ApiResponse<OrBookletDto>.Fail("End number cannot be less than start number.");
        }

        // Collect all assigned cashier user IDs (supporting multi-cashier assignment)
        var userIdsToAssign = new List<Guid>();
        if (request.AssignedUserIds != null && request.AssignedUserIds.Count > 0)
        {
            foreach (var uid in request.AssignedUserIds.Where(id => id != Guid.Empty).Distinct())
            {
                userIdsToAssign.Add(uid);
            }
        }
        else if (request.AssignedUserId.HasValue && request.AssignedUserId.Value != Guid.Empty)
        {
            userIdsToAssign.Add(request.AssignedUserId.Value);
        }

        var assignedCashierList = new List<BookletCashierDto>();
        var assignedCashierEntities = new List<OrBookletCashier>();
        Guid? primaryUserId = request.AssignedUserId.HasValue && request.AssignedUserId.Value != Guid.Empty
            ? request.AssignedUserId.Value
            : userIdsToAssign.FirstOrDefault();

        foreach (var userId in userIdsToAssign)
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
            if (user == null)
            {
                return ApiResponse<OrBookletDto>.Fail($"Cashier user '{userId}' was not found.");
            }

            var membership = await _tenantMemberRepository.GetByTenantAndUserAsync(request.TenantId, userId, cancellationToken);
            if (membership == null && !user.IsSuperAdmin)
            {
                return ApiResponse<OrBookletDto>.Fail($"Cashier '{user.FirstName} {user.LastName}' must belong to this regional office / tenant.");
            }

            if (!IsAuthorizedCashierRole(user, membership))
            {
                var roleDisplayName = membership?.Role?.Name ?? membership?.Position ?? "User";
                return ApiResponse<OrBookletDto>.Fail($"User '{user.FirstName} {user.LastName}' has the role '{roleDisplayName}' and is not authorized to hold Official Receipt booklets. Only Cashiers can be assigned.");
            }

            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            bool isPrimary = userId == primaryUserId;

            assignedCashierList.Add(new BookletCashierDto(userId, fullName, isPrimary));
            assignedCashierEntities.Add(new OrBookletCashier
            {
                CashierUserId = userId,
                IsPrimary = isPrimary,
                AssignedAt = DateTime.UtcNow
            });
        }

        var booklet = new OrBooklet
        {
            TenantId = request.TenantId,
            BookletNumber = request.BookletNumber.Trim(),
            Prefix = string.IsNullOrWhiteSpace(request.Prefix) ? null : request.Prefix.Trim(),
            StartNumber = request.StartNumber,
            EndNumber = endNumber,
            CurrentNumber = request.StartNumber,
            TotalCount = totalCount,
            IssuedCount = 0,
            AssignedUserId = primaryUserId != Guid.Empty ? primaryUserId : null,
            Status = BookletStatus.Active,
            ReceivedDate = DateTime.UtcNow,
            Remarks = request.Remarks?.Trim(),
            AssignedCashiers = assignedCashierEntities
        };

        await _bookletRepository.AddAsync(booklet, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var primaryCashierName = assignedCashierList.FirstOrDefault(c => c.IsPrimary)?.FullName ?? assignedCashierList.FirstOrDefault()?.FullName;
        var cashierDisplayNames = assignedCashierList.Select(c => c.FullName).ToList();
        var cashierIds = assignedCashierList.Select(c => c.UserId).ToList();

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
            primaryCashierName,
            booklet.Status,
            booklet.ReceivedDate,
            booklet.Remarks,
            cashierIds,
            cashierDisplayNames,
            assignedCashierList
        );

        var assignmentMessage = assignedCashierList.Count > 1
            ? $"Official Receipt booklet registered and shared with {assignedCashierList.Count} cashiers ({string.Join(", ", cashierDisplayNames)})."
            : assignedCashierList.Count == 1
            ? $"Official Receipt booklet registered and assigned to {primaryCashierName} successfully."
            : "Official Receipt booklet registered as unassigned/pooled booklet.";

        return ApiResponse<OrBookletDto>.Success(dto, assignmentMessage);
    }

    public static bool IsAuthorizedCashierRole(User user, TenantMember? membership)
    {
        if (user.IsSuperAdmin) return true;
        if (membership == null) return false;

        var roleKey = membership.Role?.Key?.ToLowerInvariant() ?? string.Empty;
        var roleName = membership.Role?.Name?.ToLowerInvariant() ?? string.Empty;
        var position = membership.Position?.ToLowerInvariant() ?? string.Empty;
        var jobTitle = membership.JobTitle?.ToLowerInvariant() ?? string.Empty;
        var designation = membership.Designation?.ToLowerInvariant() ?? string.Empty;

        // Explicitly reject roles that are distinct non-cashier positions (Accountant, Evaluator, Legal, Records)
        if (roleKey.Contains("accountant") || roleName.Contains("accountant") ||
            roleKey.Contains("evaluat") || roleName.Contains("evaluat") ||
            roleKey.Contains("legal") || roleName.Contains("legal") ||
            roleKey.Contains("record") || roleName.Contains("record"))
        {
            return false;
        }

        return roleKey == "cashier" ||
               roleKey.Contains("cashier") ||
               roleName.Contains("cashier") ||
               position.Contains("cashier") ||
               jobTitle.Contains("cashier") ||
               designation.Contains("cashier") ||
               roleKey.Contains("collect") ||
               roleName.Contains("collect") ||
               roleKey.Contains("admin") ||
               roleKey.Contains("superadmin") ||
               roleName.Contains("admin") ||
               roleKey.Contains("director") ||
               roleName.Contains("director");
    }
}
