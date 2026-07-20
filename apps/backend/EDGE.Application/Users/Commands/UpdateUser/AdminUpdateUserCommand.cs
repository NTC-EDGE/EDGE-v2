using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.UpdateUser;

public record AdminUpdateUserCommand(Guid Id, string FirstName, string LastName, bool? IsSuperAdmin = null) : IRequest<User?>;
