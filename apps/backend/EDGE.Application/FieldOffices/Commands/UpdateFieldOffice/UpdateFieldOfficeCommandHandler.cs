using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.UpdateFieldOffice;

public class UpdateFieldOfficeCommandHandler : IRequestHandler<UpdateFieldOfficeCommand, FieldOfficeDto?>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateFieldOfficeCommandHandler(
        IFieldOfficeRepository repository, 
        IGeographicRepository geographicRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _geographicRepository = geographicRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FieldOfficeDto?> Handle(UpdateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null || fieldOffice.TenantId != request.TenantId)
        {
            return null;
        }

        fieldOffice.Name = request.Name.Trim();
        fieldOffice.Code = request.Code.Trim().ToUpper();
        fieldOffice.Description = request.Description?.Trim();
        fieldOffice.RegionId = request.RegionId;
        fieldOffice.ProvinceId = request.ProvinceId;
        fieldOffice.Address = request.Address.Trim();
        fieldOffice.ContactPhone = request.ContactPhone.Trim();
        fieldOffice.ContactEmail = request.ContactEmail.Trim();
        fieldOffice.OfficerInCharge = request.OfficerInCharge.Trim();
        fieldOffice.IsActive = request.IsActive;
        fieldOffice.AllowSpectrumInspection = request.AllowSpectrumInspection;
        fieldOffice.AllowPermitIssuance = request.AllowPermitIssuance;
        fieldOffice.AllowComplaintReception = request.AllowComplaintReception;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Fetch names for DTO mapping
        var regionName = "";
        var provinceName = (string?)null;

        var region = await _geographicRepository.GetRegionByIdAsync(request.RegionId, cancellationToken);
        if (region != null)
        {
            regionName = region.Name;
        }

        if (request.ProvinceId.HasValue)
        {
            var province = await _geographicRepository.GetProvinceByIdAsync(request.ProvinceId.Value, cancellationToken);
            if (province != null)
            {
                provinceName = province.Name;
            }
        }

        return new FieldOfficeDto(
            fieldOffice.Id,
            fieldOffice.TenantId,
            fieldOffice.Name,
            fieldOffice.Code,
            fieldOffice.Description,
            fieldOffice.RegionId,
            fieldOffice.ProvinceId,
            fieldOffice.Address,
            fieldOffice.ContactPhone,
            fieldOffice.ContactEmail,
            fieldOffice.OfficerInCharge,
            fieldOffice.IsActive,
            fieldOffice.AllowSpectrumInspection,
            fieldOffice.AllowPermitIssuance,
            fieldOffice.AllowComplaintReception,
            regionName,
            provinceName
        );
    }
}
