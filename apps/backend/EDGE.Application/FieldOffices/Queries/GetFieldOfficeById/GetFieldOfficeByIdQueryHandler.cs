using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public class GetFieldOfficeByIdQueryHandler : IRequestHandler<GetFieldOfficeByIdQuery, FieldOfficeDto?>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly ITenantContextService? _tenantContextService;

    public GetFieldOfficeByIdQueryHandler(
        IFieldOfficeRepository repository,
        ITenantContextService? tenantContextService = null)
    {
        _repository = repository;
        _tenantContextService = tenantContextService;
    }

    public async Task<FieldOfficeDto?> Handle(GetFieldOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await _repository.GetByIdAsync(request.Id, cancellationToken);
        var effectiveTenantId = request.TenantId != Guid.Empty
            ? request.TenantId
            : (_tenantContextService?.TenantId ?? Guid.Empty);
        if (office == null || (effectiveTenantId != Guid.Empty && office.TenantId != effectiveTenantId))
        {
            return null;
        }

        return new FieldOfficeDto(
            office.Id,
            office.TenantId,
            office.Name,
            office.Code,
            office.Category.ToString(),
            office.Description,
            office.RegionId,
            office.ProvinceId,
            office.Address,
            office.ContactPhone,
            office.ContactEmail,
            office.OfficerInChargeId,
            office.OfficerInCharge != null && office.OfficerInCharge.User != null ? $"{office.OfficerInCharge.User.FirstName} {office.OfficerInCharge.User.LastName}".Trim() : null,
            office.OfficerInCharge?.User?.Email,
            office.IsActive,
            office.AllowSpectrumInspection,
            office.AllowPermitIssuance,
            office.AllowComplaintReception,
            office.Region?.Name,
            office.Province?.Name
        );
    }
}
