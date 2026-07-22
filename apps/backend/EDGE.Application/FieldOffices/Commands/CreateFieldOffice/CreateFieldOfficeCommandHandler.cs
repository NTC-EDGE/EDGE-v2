using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public class CreateFieldOfficeCommandHandler : IRequestHandler<CreateFieldOfficeCommand, FieldOfficeDto>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFieldOfficeCommandHandler(
        IFieldOfficeRepository repository, 
        IGeographicRepository geographicRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _geographicRepository = geographicRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FieldOfficeDto> Handle(CreateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var fieldOffice = new FieldOffice
        {
            TenantId = request.TenantId,
            Name = request.Name.Trim(),
            Code = request.Code.Trim().ToUpper(),
            Description = request.Description?.Trim(),
            RegionId = request.RegionId,
            ProvinceId = request.ProvinceId,
            Address = request.Address.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            ContactEmail = request.ContactEmail.Trim(),
            OfficerInCharge = request.OfficerInCharge.Trim(),
            IsActive = request.IsActive,
            AllowSpectrumInspection = request.AllowSpectrumInspection,
            AllowPermitIssuance = request.AllowPermitIssuance,
            AllowComplaintReception = request.AllowComplaintReception
        };

        await _repository.AddAsync(fieldOffice, cancellationToken);
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
