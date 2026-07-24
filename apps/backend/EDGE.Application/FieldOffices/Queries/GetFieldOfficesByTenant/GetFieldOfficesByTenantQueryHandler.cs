using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

public class GetFieldOfficesByTenantQueryHandler(
    ITenantRepository tenantRepository,
    IFieldOfficeRepository fieldOfficeRepository)
    : IRequestHandler<GetFieldOfficesByTenantQuery, ApiResponse<List<FieldOfficeDto>>>
{
    public async Task<ApiResponse<List<FieldOfficeDto>>> Handle(
        GetFieldOfficesByTenantQuery request,
        CancellationToken cancellationToken)
    {
        var tenant = await tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            return ApiResponse<List<FieldOfficeDto>>.Fail($"Tenant with ID '{request.TenantId}' was not found.");
        }

        var fieldOffices = await fieldOfficeRepository.GetAllAsync(tenant.RegionId, cancellationToken);
        var dtos = fieldOffices.Select(f => new FieldOfficeDto(f.Id, f.Name, f.Code, f.RegionId, f.Region?.Name)).ToList();

        return ApiResponse<List<FieldOfficeDto>>.Success(dtos);
    }
}
