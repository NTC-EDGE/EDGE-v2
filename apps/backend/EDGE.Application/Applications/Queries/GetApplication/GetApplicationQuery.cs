using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Queries;

public record GetApplicationQuery(Guid Id) : IRequest<ApplicationRecord?>;
