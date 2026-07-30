using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public class UpdateFieldOfficeCommandHandler : IRequestHandler<UpdateFieldOfficeCommand, FieldOfficeDto?>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFieldOfficeCommandHandler(
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

    public async Task<FieldOfficeDto?> Handle(UpdateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null)
        {
            return null;
        }

        var category = string.IsNullOrWhiteSpace(request.Category) ? "Main" : request.Category.Trim();
        if (category == "Extension Office") category = "Extension";
        if (category == "Main Office") category = "Main";

        if (!string.IsNullOrWhiteSpace(request.Name)) fieldOffice.Name = request.Name.Trim();
        if (!string.IsNullOrWhiteSpace(request.Code)) fieldOffice.Code = request.Code.Trim().ToUpper();
        fieldOffice.Category = category;
        fieldOffice.Description = request.Description?.Trim();
        if (request.RegionId.HasValue && request.RegionId.Value != Guid.Empty) fieldOffice.RegionId = request.RegionId.Value;
        if (request.ProvinceId.HasValue) fieldOffice.ProvinceId = request.ProvinceId.Value;
        if (request.Address != null) fieldOffice.Address = request.Address.Trim();
        if (request.ContactPhone != null) fieldOffice.ContactPhone = request.ContactPhone.Trim();
        if (request.ContactEmail != null) fieldOffice.ContactEmail = request.ContactEmail.Trim();
        if (request.OfficerInChargeId.HasValue && request.OfficerInChargeId.Value != Guid.Empty) fieldOffice.OfficerInChargeId = request.OfficerInChargeId.Value;
        fieldOffice.IsActive = request.IsActive;
        fieldOffice.AllowSpectrumInspection = request.AllowSpectrumInspection;
        fieldOffice.AllowPermitIssuance = request.AllowPermitIssuance;
        fieldOffice.AllowComplaintReception = request.AllowComplaintReception;

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
            fieldOffice.Category,
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
