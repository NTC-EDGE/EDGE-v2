using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public class GetFieldOfficesQueryHandler : IRequestHandler<GetFieldOfficesQuery, List<FieldOfficeDto>>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly ITenantContextService? _tenantContextService;

    public GetFieldOfficesQueryHandler(
        IFieldOfficeRepository repository,
        ITenantContextService? tenantContextService = null)
    {
        _repository = repository;
        _tenantContextService = tenantContextService;
    }

    public async Task<List<FieldOfficeDto>> Handle(GetFieldOfficesQuery request, CancellationToken cancellationToken)
    {
        var effectiveTenantId = (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
            ? request.TenantId
            : _tenantContextService?.TenantId;

        var offices = await _repository.GetFilteredAsync(effectiveTenantId, request.RegionId, cancellationToken);
        if (request.IsActive.HasValue)
        {
            offices = offices.Where(f => f.IsActive == request.IsActive.Value).ToList();
        }
        return offices.Select(f => new FieldOfficeDto(
            f.Id,
            f.TenantId,
            f.Name,
            f.Code,
            f.Category.ToString(),
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
    }
}
