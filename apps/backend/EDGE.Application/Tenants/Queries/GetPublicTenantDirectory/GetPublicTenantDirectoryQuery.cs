using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.Tenants.Queries.GetPublicTenantDirectory;

public record GetPublicTenantDirectoryQuery : IRequest<List<PublicRegionalOfficeDto>>;

public class GetPublicTenantDirectoryQueryHandler : IRequestHandler<GetPublicTenantDirectoryQuery, List<PublicRegionalOfficeDto>>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IFieldOfficeRepository _fieldOfficeRepository;

    public GetPublicTenantDirectoryQueryHandler(
        ITenantRepository tenantRepository,
        IFieldOfficeRepository fieldOfficeRepository)
    {
        _tenantRepository = tenantRepository;
        _fieldOfficeRepository = fieldOfficeRepository;
    }

    public async Task<List<PublicRegionalOfficeDto>> Handle(
        GetPublicTenantDirectoryQuery request,
        CancellationToken cancellationToken)
    {
        var tenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var fieldOffices = await _fieldOfficeRepository.GetAllAsync(cancellationToken);

        var activeFieldOfficesByTenant = fieldOffices
            .Where(f => f.IsActive && !f.IsDeleted)
            .GroupBy(f => f.TenantId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<PublicRegionalOfficeDto>();

        foreach (var tenant in tenants.Where(t => t.IsActive && !t.IsDeleted))
        {
            var officeList = activeFieldOfficesByTenant.TryGetValue(tenant.Id, out var matchedOffices)
                ? matchedOffices
                : [];

            var mappedOffices = officeList
                .OrderBy(o => o.Category == FieldOfficeCategory.Main ? 0 : 1)
                .ThenBy(o => o.Name)
                .Select(o =>
                {
                    var oicUser = o.OfficerInCharge?.User;
                    var oicName = oicUser != null
                        ? $"{oicUser.FirstName} {oicUser.LastName}".Trim()
                        : string.Empty;

                    return new PublicFieldOfficeDto
                    {
                        Id = o.Id,
                        Name = o.Name,
                        Code = o.Code,
                        Category = o.Category.ToString(),
                        Address = o.Address,
                        ContactPhone = o.ContactPhone,
                        ContactEmail = o.ContactEmail,
                        OfficeHead = string.IsNullOrWhiteSpace(oicName) ? "Regional Officer-in-Charge" : oicName,
                        AllowPermitIssuance = o.AllowPermitIssuance,
                        AllowComplaintReception = o.AllowComplaintReception,
                        AllowSpectrumInspection = o.AllowSpectrumInspection
                    };
                })
                .ToList();

            var mainOffice = mappedOffices.FirstOrDefault();
            var regionName = !string.IsNullOrWhiteSpace(tenant.Region?.Name)
                ? tenant.Region.Name
                : (tenant.Name ?? string.Empty);
            var regionCode = !string.IsNullOrWhiteSpace(tenant.Region?.Code)
                ? tenant.Region.Code
                : (tenant.Code ?? string.Empty);

            var defaultEmailSlug = (tenant.Code ?? "ncr").ToLowerInvariant().Replace("ntc-", "").Replace(" ", "");

            result.Add(new PublicRegionalOfficeDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Code = tenant.Code,
                Description = tenant.Description,
                RegionId = tenant.RegionId,
                RegionName = regionName,
                RegionCode = regionCode,
                PrimaryAddress = !string.IsNullOrWhiteSpace(mainOffice?.Address)
                    ? mainOffice.Address
                    : $"NTC {tenant.Name} Regional Office, Republic of the Philippines",
                PrimaryPhone = !string.IsNullOrWhiteSpace(mainOffice?.ContactPhone)
                    ? mainOffice.ContactPhone
                    : "(02) 8924-4040 / 8924-4042",
                PrimaryEmail = !string.IsNullOrWhiteSpace(mainOffice?.ContactEmail)
                    ? mainOffice.ContactEmail
                    : $"{defaultEmailSlug}@ntc.gov.ph",
                FieldOffices = mappedOffices
            });
        }

        return result
            .OrderBy(r => r.Code.Contains("NCR", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
            .ThenBy(r => r.Code)
            .ThenBy(r => r.Name)
            .ToList();
    }
}
