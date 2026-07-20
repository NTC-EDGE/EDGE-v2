using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Queries;

public class GetMembersByTenantQueryHandler : IRequestHandler<GetMembersByTenantQuery, List<TenantMemberDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantMemberRepository _memberRepository;

    public GetMembersByTenantQueryHandler(ITenantRepository tenantRepository, ITenantMemberRepository memberRepository)
    {
        _tenantRepository = tenantRepository;
        _memberRepository = memberRepository;
    }

    public async Task<List<TenantMemberDto>> Handle(GetMembersByTenantQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found.");
        }

        var members = await _memberRepository.GetMembersByTenantAsync(request.TenantId, cancellationToken);

        return members.Select(m => new TenantMemberDto
        {
            Id = m.Id,
            TenantId = m.TenantId,
            TenantName = tenant.Name,
            UserId = m.UserId,
            UserEmail = string.Empty, // Populate dynamically later when User entity is available
            UserFirstName = string.Empty,
            UserLastName = string.Empty,
            RoleId = m.RoleId,
            JobTitle = m.JobTitle,
            Level = m.Level,
            Division = m.Division,
            Position = m.Position,
            Designation = m.Designation,
            IsDeleted = m.IsDeleted,
            CreatedAt = m.CreatedAt,
            CreatedBy = m.CreatedBy,
            LastModifiedAt = m.LastModifiedAt,
            LastModifiedBy = m.LastModifiedBy
        }).ToList();
    }
}
