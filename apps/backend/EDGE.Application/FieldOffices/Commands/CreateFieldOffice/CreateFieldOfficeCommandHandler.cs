using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.DTOs;

namespace EDGE.Application.FieldOffices.Commands.CreateFieldOffice;

public class CreateFieldOfficeCommandHandler : IRequestHandler<CreateFieldOfficeCommand, FieldOfficeDto>
{
    private readonly IFieldOfficeRepository _repository;
    private readonly IGeographicRepository _geographicRepository;
    private readonly ITenantMemberRepository _tenantMemberRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateFieldOfficeCommandHandler(
        IFieldOfficeRepository repository,
        IGeographicRepository geographicRepository,
        ITenantMemberRepository tenantMemberRepository,
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _geographicRepository = geographicRepository;
        _tenantMemberRepository = tenantMemberRepository;
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<FieldOfficeDto> Handle(CreateFieldOfficeCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found. Please provide a valid tenant ID.");
        }

        var region = await _geographicRepository.GetRegionByIdAsync(request.RegionId, cancellationToken);
        if (region == null)
        {
            throw new KeyNotFoundException($"Region with ID '{request.RegionId}' was not found. Please provide a valid region ID.");
        }

        var officer = await _tenantMemberRepository.GetByIdAsync(request.OfficerInChargeId, cancellationToken);
        if (officer == null)
        {
            throw new KeyNotFoundException($"Officer in Charge (Tenant Member) with ID '{request.OfficerInChargeId}' was not found. Please provide a valid tenant member ID.");
        }

        var provinceName = (string?)null;
        if (request.ProvinceId.HasValue)
        {
            var province = await _geographicRepository.GetProvinceByIdAsync(request.ProvinceId.Value, cancellationToken);
            if (province == null)
            {
                throw new KeyNotFoundException($"Province with ID '{request.ProvinceId.Value}' was not found.");
            }
            provinceName = province.Name;
        }

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
            OfficerInChargeId = request.OfficerInChargeId,
            IsActive = request.IsActive,
            AllowSpectrumInspection = request.AllowSpectrumInspection,
            AllowPermitIssuance = request.AllowPermitIssuance,
            AllowComplaintReception = request.AllowComplaintReception
        };

        await _repository.AddAsync(fieldOffice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var officerName = officer.User != null ? $"{officer.User.FirstName} {officer.User.LastName}".Trim() : string.Empty;
        var officerEmail = officer.User != null ? officer.User.Email : string.Empty;

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
            fieldOffice.OfficerInChargeId,
            officerName,
            officerEmail,
            fieldOffice.IsActive,
            fieldOffice.AllowSpectrumInspection,
            fieldOffice.AllowPermitIssuance,
            fieldOffice.AllowComplaintReception,
            region.Name,
            provinceName
        );
    }
}
