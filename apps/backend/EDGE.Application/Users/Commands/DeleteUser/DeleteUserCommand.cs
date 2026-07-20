using MediatR;

namespace EDGE.Application.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest<bool>;
