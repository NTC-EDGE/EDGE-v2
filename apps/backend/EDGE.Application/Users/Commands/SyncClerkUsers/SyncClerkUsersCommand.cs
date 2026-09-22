using MediatR;

namespace EDGE.Application.Users.Commands.SyncClerkUsers;

public record SyncClerkUsersCommand(bool AssignDefaultTenantIfMissing = true) : IRequest<SyncClerkUsersResultDto>;
