using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Queries;

public record GetMemberDetailsQuery(Guid MemberId, Guid TenantId) : IRequest<TenantMemberDto>;
