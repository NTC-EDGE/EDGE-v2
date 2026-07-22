using MediatR;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public record GetFieldOfficeByIdQuery(Guid Id, Guid TenantId) : IRequest<FieldOfficeDto?>;
