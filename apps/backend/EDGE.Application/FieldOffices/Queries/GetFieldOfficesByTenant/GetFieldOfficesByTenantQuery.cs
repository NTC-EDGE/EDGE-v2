using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

public record GetFieldOfficesByTenantQuery(Guid TenantId) : IRequest<ApiResponse<List<FieldOfficeDto>>>;
