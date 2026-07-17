using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Applications.Queries;

public record GetApplicationsQuery() : IRequest<List<ApplicationRecord>>;
