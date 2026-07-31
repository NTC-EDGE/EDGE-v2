using System;
using System.Collections.Generic;
using System.Linq;
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
        // 1. Resolve Tenant
        var tenantId = request.TenantId.GetValueOrDefault();
        Tenant? tenant = null;
        if (tenantId != Guid.Empty)
        {
            tenant = await _tenantRepository.GetByIdAsync(tenantId, cancellationToken);
        }
        if (tenant == null)
        {
            var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
            tenant = tenants.FirstOrDefault();
            if (tenant == null)
            {
                throw new KeyNotFoundException("No active tenant found in system to associate with field office.");
            }
            tenantId = tenant.Id;
        }

        // 2. Resolve Region
        var regionId = request.RegionId.GetValueOrDefault();
        Region? region = null;
        if (regionId != Guid.Empty)
        {
            region = await _geographicRepository.GetRegionByIdAsync(regionId, cancellationToken);
        }
        if (region == null)
        {
            var regions = await _geographicRepository.GetRegionsAsync(null, cancellationToken);
            region = regions.FirstOrDefault();
            if (region == null)
            {
                throw new KeyNotFoundException("No geographic region found in system.");
            }
            regionId = region.Id;
        }

        // 3. Resolve Officer in Charge (optional fallback)
        var officerId = request.OfficerInChargeId.GetValueOrDefault();
        TenantMember? officer = null;
        if (officerId != Guid.Empty)
        {
            officer = await _tenantMemberRepository.GetByIdAsync(officerId, cancellationToken);
        }
        if (officer == null)
        {
            var members = await _tenantMemberRepository.GetMembersByTenantAsync(tenantId, cancellationToken);
            officer = members.FirstOrDefault();
            if (officer != null)
            {
                officerId = officer.Id;
            }
        }

        var provinceName = (string?)null;
        if (request.ProvinceId.HasValue && request.ProvinceId.Value != Guid.Empty)
        {
            var province = await _geographicRepository.GetProvinceByIdAsync(request.ProvinceId.Value, cancellationToken);
            if (province != null)
            {
                provinceName = province.Name;
            }
        }

        var category = string.IsNullOrWhiteSpace(request.Category) ? "Main" : request.Category.Trim();
        if (category == "Extension Office") category = "Extension";
        if (category == "Main Office") category = "Main";

        var fieldOffice = new FieldOffice
        {
            TenantId = tenantId,
            Name = (request.Name ?? "Field Office").Trim(),
            Code = (request.Code ?? "FO-001").Trim().ToUpper(),
            Category = category,
            Description = request.Description?.Trim(),
            RegionId = regionId,
            ProvinceId = request.ProvinceId,
            Address = (request.Address ?? "").Trim(),
            ContactPhone = (request.ContactPhone ?? "").Trim(),
            ContactEmail = (request.ContactEmail ?? "").Trim(),
            OfficerInChargeId = officerId,
            IsActive = request.IsActive,
            AllowSpectrumInspection = request.AllowSpectrumInspection,
            AllowPermitIssuance = request.AllowPermitIssuance,
            AllowComplaintReception = request.AllowComplaintReception
        };

        await _repository.AddAsync(fieldOffice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var officerName = officer != null && officer.User != null ? $"{officer.User.FirstName} {officer.User.LastName}".Trim() : string.Empty;
        var officerEmail = officer != null && officer.User != null ? officer.User.Email : string.Empty;

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
            region.Name,
            provinceName
        );
    }
}
