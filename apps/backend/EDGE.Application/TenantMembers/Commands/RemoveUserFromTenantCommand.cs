using MediatR;

namespace EDGE.Application.TenantMembers.Commands;

public record RemoveUserFromTenantCommand(Guid MemberId, Guid TenantId) : IRequest<bool>;
