using MediatR;

namespace EDGE.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;

public record LoginResponse(string Token, string Email, string FirstName, string LastName, string Role);
