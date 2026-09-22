using System;
using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Commands.ChangeUserEmail;

public record AdminChangeUserEmailCommand(
    Guid Id,
    string NewEmail
) : IRequest<User?>;
