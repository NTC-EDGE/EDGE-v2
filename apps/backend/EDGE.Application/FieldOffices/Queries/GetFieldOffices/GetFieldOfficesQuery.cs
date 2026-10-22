using MediatR;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public record GetFieldOfficesQuery(Guid? TenantId = null, Guid? RegionId = null, bool? IsActive = null) : IRequest<List<FieldOfficeDto>>;
