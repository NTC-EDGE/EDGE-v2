using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IFieldOfficeRepository? _fieldOfficeRepository;
    private readonly ITenantMemberRepository? _tenantMemberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(
        ITenantRepository tenantRepository,
        IUnitOfWork unitOfWork,
        IFieldOfficeRepository? fieldOfficeRepository = null,
        ITenantMemberRepository? tenantMemberRepository = null)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
        _fieldOfficeRepository = fieldOfficeRepository;
        _tenantMemberRepository = tenantMemberRepository;
    }

    public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var existingTenant = await _tenantRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existingTenant != null)
        {
            throw new InvalidOperationException($"Tenant with code '{request.Code}' already exists.");
        }

        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var cleanName = request.Name.Trim();

        var tenant = new Tenant
        {
            Name = cleanName,
            Code = normalizedCode,
            Description = request.Description,
            IsActive = false,
            RegionId = request.RegionId
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Automatically create an equivalent Main Office as the default Field Office for this Tenant
        if (_fieldOfficeRepository != null)
        {
            var existingOffices = await _fieldOfficeRepository.GetByTenantIdAsync(tenant.Id, cancellationToken);
            if (!existingOffices.Any(fo => fo.Category == FieldOfficeCategory.Main))
            {
                Guid officerInChargeId = Guid.Empty;
                if (_tenantMemberRepository != null)
                {
                    var fallbackMember = await _tenantMemberRepository.GetFirstAvailableMemberAsync(tenant.Id, cancellationToken);
                    if (fallbackMember != null)
                    {
                        officerInChargeId = fallbackMember.Id;
                    }
                }

                var mainOfficeName = cleanName.EndsWith("Main Office", StringComparison.OrdinalIgnoreCase)
                    ? cleanName
                    : $"{cleanName} - Main Office";
                var mainOfficeCode = $"{normalizedCode}-MAIN";

                var mainOffice = new FieldOffice
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenant.Id,
                    Name = mainOfficeName,
                    Code = mainOfficeCode,
                    Category = FieldOfficeCategory.Main,
                    Description = !string.IsNullOrWhiteSpace(tenant.Description)
                        ? tenant.Description
                        : $"Regional Main Office for {cleanName}",
                    RegionId = tenant.RegionId,
                    Address = cleanName,
                    ContactPhone = string.Empty,
                    ContactEmail = string.Empty,
                    OfficerInChargeId = officerInChargeId,
                    IsActive = true,
                    AllowSpectrumInspection = true,
                    AllowPermitIssuance = true,
                    AllowComplaintReception = true
                };

                await _fieldOfficeRepository.AddAsync(mainOffice, cancellationToken);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
        }

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Code = tenant.Code,
            Description = tenant.Description,
            IsActive = tenant.IsActive,
            RegionId = tenant.RegionId,
            CreatedAt = tenant.CreatedAt,
            CreatedBy = tenant.CreatedBy,
            LastModifiedAt = tenant.LastModifiedAt,
            LastModifiedBy = tenant.LastModifiedBy
        };
    }
}
