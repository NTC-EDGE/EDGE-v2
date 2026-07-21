using MediatR;
using EDGE.Application.TenantMembers.DTOs;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.TenantMembers.Queries;

public record GetTenantMembersQuery(Guid TenantId) : IRequest<List<TenantMemberDto>>;

public class GetTenantMembersQueryHandler : IRequestHandler<GetTenantMembersQuery, List<TenantMemberDto>>
{
    private readonly ITenantMemberRepository _repository;

    public GetTenantMembersQueryHandler(ITenantMemberRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TenantMemberDto>> Handle(GetTenantMembersQuery request, CancellationToken cancellationToken)
    {
        var members = await _repository.GetMembersOfTenantAsync(request.TenantId, cancellationToken);
        return members.Select(m => new TenantMemberDto(
            m.User.Id,
            $"{m.User.FirstName} {m.User.LastName}".Trim(),
            m.User.Email,
            m.Tenant.Id,
            m.Tenant.Name,
            m.Role.Id,
            m.Role.Name,
            m.Role.Key,
            m.IsActive,
            m.JoinedAt
        )).ToList();
    }
}

public record GetUserTenantsQuery(Guid UserId) : IRequest<List<TenantMemberDto>>;

public class GetUserTenantsQueryHandler : IRequestHandler<GetUserTenantsQuery, List<TenantMemberDto>>
{
    private readonly ITenantMemberRepository _repository;

    public GetUserTenantsQueryHandler(ITenantMemberRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TenantMemberDto>> Handle(GetUserTenantsQuery request, CancellationToken cancellationToken)
    {
        var members = await _repository.GetTenantsForUserAsync(request.UserId, cancellationToken);
        return members.Select(m => new TenantMemberDto(
            m.User.Id,
            $"{m.User.FirstName} {m.User.LastName}".Trim(),
            m.User.Email,
            m.Tenant.Id,
            m.Tenant.Name,
            m.Role.Id,
            m.Role.Name,
            m.Role.Key,
            m.IsActive,
            m.JoinedAt
        )).ToList();
    }
}
