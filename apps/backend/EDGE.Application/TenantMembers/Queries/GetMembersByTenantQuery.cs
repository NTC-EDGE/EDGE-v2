using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Queries;

public record GetMembersByTenantQuery(Guid TenantId) : IRequest<List<TenantMemberDto>>;
