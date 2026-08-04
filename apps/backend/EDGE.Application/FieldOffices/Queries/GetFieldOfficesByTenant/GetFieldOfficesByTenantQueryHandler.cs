using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficesByTenant;

public class GetFieldOfficesByTenantQueryHandler(
    IFieldOfficeRepository fieldOfficeRepository)
    : IRequestHandler<GetFieldOfficesByTenantQuery, ApiResponse<List<FieldOfficeDto>>>
{
    public async Task<ApiResponse<List<FieldOfficeDto>>> Handle(
        GetFieldOfficesByTenantQuery request,
        CancellationToken cancellationToken)
    {
        var fieldOffices = await fieldOfficeRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = fieldOffices.Select(f => new FieldOfficeDto(
            f.Id,
            f.TenantId,
            f.Name,
            f.Code,
            f.Category ?? "Main",
            f.Description,
            f.RegionId,
            f.ProvinceId,
            f.Address,
            f.ContactPhone,
            f.ContactEmail,
            f.OfficerInChargeId,
            f.OfficerInCharge != null && f.OfficerInCharge.User != null ? $"{f.OfficerInCharge.User.FirstName} {f.OfficerInCharge.User.LastName}".Trim() : null,
            f.OfficerInCharge?.User?.Email,
            f.IsActive,
            f.AllowSpectrumInspection,
            f.AllowPermitIssuance,
            f.AllowComplaintReception,
            f.Region?.Name,
            f.Province?.Name
        )).ToList();

        return ApiResponse<List<FieldOfficeDto>>.Success(dtos);
    }
}
