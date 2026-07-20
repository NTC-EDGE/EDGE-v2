using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Queries;

public record GetUserByIdQuery(Guid Id) : IRequest<User?>;
