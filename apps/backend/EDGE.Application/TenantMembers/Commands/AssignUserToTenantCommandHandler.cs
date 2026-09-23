using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public class AssignUserToTenantCommandHandler : IRequestHandler<AssignUserToTenantCommand, TenantMemberDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public AssignUserToTenantCommandHandler(
        ITenantRepository tenantRepository,
        ITenantMemberRepository memberRepository,
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _memberRepository = memberRepository;
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto> Handle(AssignUserToTenantCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify Tenant exists
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found.");
        }

        // 2. Verify Caller Tenant Authorization (SuperAdmins can assign to any tenant; Tenant Admins can only assign to their own tenant)
        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TenantId,
            "You are only authorized to assign members to your own regional tenant.",
            cancellationToken);

        // 3. Verify Role belongs to target tenant or is a standard role
        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null || (role.TenantId != null && role.TenantId != request.TenantId))
        {
            throw new InvalidOperationException($"Role '{request.RoleId}' is not valid for tenant '{request.TenantId}'.");
        }

        // 4. Verify duplication
        var existingAssignment = await _memberRepository.GetByTenantAndUserAsync(request.TenantId, request.UserId, cancellationToken);
        if (existingAssignment != null)
        {
            throw new InvalidOperationException($"User '{request.UserId}' is already assigned to Tenant '{request.TenantId}'.");
        }

        var member = new TenantMember
        {
            TenantId = request.TenantId,
            UserId = request.UserId,
            RoleId = request.RoleId,
            JobTitle = request.JobTitle,
            Level = request.Level,
            Division = request.Division,
            Position = request.Position,
            Designation = request.Designation
        };

        await _memberRepository.AddAsync(member, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Fetch back with navigation properties populated
        var savedMember = await _memberRepository.GetByIdAsync(member.Id, cancellationToken);
        if (savedMember == null)
        {
            throw new InvalidOperationException("Failed to retrieve the newly created tenant member.");
        }

        return new TenantMemberDto
        {
            Id = savedMember.Id,
            TenantId = savedMember.TenantId,
            TenantName = savedMember.Tenant?.Name ?? string.Empty,
            UserId = savedMember.UserId,
            UserEmail = string.Empty, // Populate dynamically later when User entity is available
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            RoleId = savedMember.RoleId,
            JobTitle = savedMember.JobTitle,
            Level = savedMember.Level,
            Division = savedMember.Division,
            Position = savedMember.Position,
            Designation = savedMember.Designation,
            IsDeleted = savedMember.IsDeleted,
            CreatedAt = savedMember.CreatedAt,
            CreatedBy = savedMember.CreatedBy,
            LastModifiedAt = savedMember.LastModifiedAt,
            LastModifiedBy = savedMember.LastModifiedBy
        };
    }
}
