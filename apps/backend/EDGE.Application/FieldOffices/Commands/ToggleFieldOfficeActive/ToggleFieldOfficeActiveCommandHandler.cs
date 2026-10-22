using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.ToggleFieldOfficeActive;

public class ToggleFieldOfficeActiveCommandHandler : IRequestHandler<ToggleFieldOfficeActiveCommand, FieldOfficeDto?>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleFieldOfficeActiveCommandHandler(
        IFieldOfficeRepository repository,
        IGeographicRepository geographicRepository,
        ITenantMemberRepository tenantMemberRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _geographicRepository = geographicRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FieldOfficeDto?> Handle(ToggleFieldOfficeActiveCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null)
        {
            return null;
        }

        fieldOffice.IsActive = !fieldOffice.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Fetch names for DTO mapping
        var regionName = "";
        var provinceName = (string?)null;
        var officerName = "";
        var officerEmail = "";

        var region = await _geographicRepository.GetRegionByIdAsync(fieldOffice.RegionId, cancellationToken);
        if (region != null)
        {
            regionName = region.Name;
        }

        if (fieldOffice.ProvinceId.HasValue)
        {
            var province = await _geographicRepository.GetProvinceByIdAsync(fieldOffice.ProvinceId.Value, cancellationToken);
            if (province != null)
            {
                provinceName = province.Name;
            }
        }

        var officer = await _tenantMemberRepository.GetByIdAsync(fieldOffice.OfficerInChargeId, cancellationToken);
        if (officer != null && officer.User != null)
        {
            officerName = $"{officer.User.FirstName} {officer.User.LastName}".Trim();
            officerEmail = officer.User.Email;
        }

        return new FieldOfficeDto(
            fieldOffice.Id,
            fieldOffice.TenantId,
            fieldOffice.Name,
            fieldOffice.Code,
            fieldOffice.Category.ToString(),
            fieldOffice.Description,
            fieldOffice.RegionId,
            fieldOffice.ProvinceId,
            fieldOffice.Address,
            fieldOffice.ContactPhone,
            fieldOffice.ContactEmail,
            fieldOffice.OfficerInChargeId,
            officerName,
            officerEmail,
            fieldOffice.IsActive,
            fieldOffice.AllowSpectrumInspection,
            fieldOffice.AllowPermitIssuance,
            fieldOffice.AllowComplaintReception,
            regionName,
            provinceName
        );
    }
}
