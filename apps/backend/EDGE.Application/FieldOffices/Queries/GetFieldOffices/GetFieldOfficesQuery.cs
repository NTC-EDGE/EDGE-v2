using MediatR;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public record GetFieldOfficesQuery(Guid TenantId) : IRequest<List<FieldOfficeDto>>;
