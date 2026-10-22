using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public class UpdateMemberDetailsCommandHandler : IRequestHandler<UpdateMemberDetailsCommand, TenantMemberDto>
{
    private readonly ITenantMemberRepository _memberRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateMemberDetailsCommandHandler(
        ITenantMemberRepository memberRepository,
        IRoleRepository roleRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _memberRepository = memberRepository;
        _roleRepository = roleRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantMemberDto> Handle(UpdateMemberDetailsCommand request, CancellationToken cancellationToken)
    {
        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TenantId,
            "You are only authorized to update members in your own regional tenant.",
            cancellationToken);

        var member = await _memberRepository.GetByIdAsync(request.MemberId, cancellationToken);
        if (member == null || member.TenantId != request.TenantId)
        {
            throw new KeyNotFoundException($"Tenant member with ID '{request.MemberId}' was not found in Tenant '{request.TenantId}'.");
        }

        var role = await _roleRepository.GetByIdAsync(request.RoleId, cancellationToken);
        if (role == null || (role.TenantId != null && role.TenantId != request.TenantId))
        {
            throw new InvalidOperationException($"Role '{request.RoleId}' is not valid for tenant '{request.TenantId}'.");
        }

        member.RoleId = request.RoleId;
        member.JobTitle = request.JobTitle;
        member.Level = request.Level;
        member.Division = request.Division;
        member.Position = request.Position;
        member.Designation = request.Designation;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantMemberDto
        {
            Id = member.Id,
            TenantId = member.TenantId,
            TenantName = member.Tenant?.Name ?? string.Empty,
            UserId = member.UserId,
            UserEmail = string.Empty, // Populate dynamically later when User entity is available
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            RoleId = member.RoleId,
            JobTitle = member.JobTitle,
            Level = member.Level,
            Division = member.Division,
            Position = member.Position,
            Designation = member.Designation,
            IsDeleted = member.IsDeleted,
            CreatedAt = member.CreatedAt,
            CreatedBy = member.CreatedBy,
            LastModifiedAt = member.LastModifiedAt,
            LastModifiedBy = member.LastModifiedBy
        };
    }
}
