using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public class GetFieldOfficeByIdQueryHandler : IRequestHandler<GetFieldOfficeByIdQuery, FieldOfficeDto?>
{
    private readonly IFieldOfficeRepository _repository;

    public GetFieldOfficeByIdQueryHandler(IFieldOfficeRepository repository)
    {
        _repository = repository;
    }

    public async Task<FieldOfficeDto?> Handle(GetFieldOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var office = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (office == null || office.TenantId != request.TenantId)
        {
            return null;
        }

        return new FieldOfficeDto(
            office.Id,
            office.TenantId,
            office.Name,
            office.Code,
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
