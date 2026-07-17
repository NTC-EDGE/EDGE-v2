using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Users.Queries;

public record GetUsersQuery() : IRequest<List<User>>;
