using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public class GetFieldOfficesQueryHandler : IRequestHandler<GetFieldOfficesQuery, List<FieldOfficeDto>>
{
    private readonly IFieldOfficeRepository _repository;

    public GetFieldOfficesQueryHandler(IFieldOfficeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<FieldOfficeDto>> Handle(GetFieldOfficesQuery request, CancellationToken cancellationToken)
    {
        var offices = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        return offices.Select(f => new FieldOfficeDto(
            f.Id,
            f.TenantId,
            f.Name,
            f.Code,
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
