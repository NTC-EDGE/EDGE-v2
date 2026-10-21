using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;

namespace EDGE.Infrastructure.Services;

public class RegionalConfigurationService : IRegionalConfigurationService
{
    private const string CategoryName = "TenantRegionalConfig";
    private readonly ApplicationDbContext _context;
    private readonly ISystemConfigRepository _systemConfigRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegionalConfigurationService(
        ApplicationDbContext context,
        ISystemConfigRepository systemConfigRepository,
        IUnitOfWork unitOfWork)
    {
        _context = context;
        _systemConfigRepository = systemConfigRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RegionalConfigurationDto> GetConfigurationAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        Tenant? tenant = null;

        if (tenantId != Guid.Empty)
        {
            tenant = await _context.Tenants.AsNoTracking().Include(t => t.Region).FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);
        }

        if (tenant == null)
        {
            tenant = await _context.Tenants.AsNoTracking().Include(t => t.Region).OrderBy(t => t.Code).FirstOrDefaultAsync(cancellationToken);
        }

        var resolvedTenantId = tenant?.Id ?? tenantId;
        var tenantCode = tenant?.Code ?? "10";
        var tenantName = tenant?.Name ?? "Regional Office";
        var regionId = tenant?.RegionId;

        var cleanCode = ExtractCodeDigits(tenantCode);
        if (string.IsNullOrWhiteSpace(cleanCode)) cleanCode = "10";

        var soaConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:RCCodeSOA", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:RCCodeSOA", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync("RCCodeSOA", cancellationToken);

        var opConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:RCCodeOP", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:RCCodeOP", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync("RCCodeOP", cancellationToken);

        var fundConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:FundCluster", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:FundCluster", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync("FundCluster", cancellationToken);

        var routingConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:RequestAndComplaintRouting", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:RequestAndComplaintRouting", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync("RequestAndComplaintRouting", cancellationToken);

        var emailConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:SupportEmail", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:SupportEmail", cancellationToken);

        var phoneConfig = await _systemConfigRepository.GetByKeyAsync($"TenantConfig:{resolvedTenantId}:SupportPhone", cancellationToken)
            ?? await _systemConfigRepository.GetByKeyAsync($"RegionalConfig:{cleanCode}:SupportPhone", cancellationToken);

        return new RegionalConfigurationDto
        {
            TenantId = resolvedTenantId,
            RegionId = regionId,
            TenantCode = tenantCode,
            TenantName = tenantName,
            RcCodeSoa = !string.IsNullOrWhiteSpace(soaConfig?.Value) ? soaConfig.Value : cleanCode,
            RcCodeOp = !string.IsNullOrWhiteSpace(opConfig?.Value) ? opConfig.Value : cleanCode,
            FundCluster = !string.IsNullOrWhiteSpace(fundConfig?.Value) ? fundConfig.Value : "01",
            RequestAndComplaintRouting = !string.IsNullOrWhiteSpace(routingConfig?.Value) ? routingConfig.Value : "DirectToLegal",
            SupportEmail = !string.IsNullOrWhiteSpace(emailConfig?.Value) ? emailConfig.Value : "region10@ntc.gov.ph",
            SupportPhone = !string.IsNullOrWhiteSpace(phoneConfig?.Value) ? phoneConfig.Value : "(088) 856-1234 / (02) 8924-4008"
        };
    }

    public async Task<RegionalConfigurationDto> UpdateConfigurationAsync(RegionalConfigurationDto dto, CancellationToken cancellationToken = default)
    {
        var tenantId = dto.TenantId;

        await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:RCCodeSOA", dto.RcCodeSoa ?? "61", $"Responsibility Center Code for SOA series in tenant {tenantId}", cancellationToken);
        await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:RCCodeOP", dto.RcCodeOp ?? "61", $"Responsibility Center Code for OP series in tenant {tenantId}", cancellationToken);
        await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:FundCluster", dto.FundCluster ?? "01", $"Accounting Fund Cluster for tenant {tenantId}", cancellationToken);
        await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:RequestAndComplaintRouting", dto.RequestAndComplaintRouting ?? "DirectToLegal", $"Client application routing preference for Requests and Complaints in tenant {tenantId}", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dto.SupportEmail))
        {
            await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:SupportEmail", dto.SupportEmail, $"Support email contact for tenant {tenantId}", cancellationToken);
        }
        if (!string.IsNullOrWhiteSpace(dto.SupportPhone))
        {
            await SetOrUpdateConfigAsync($"TenantConfig:{tenantId}:SupportPhone", dto.SupportPhone, $"Support telephone contact for tenant {tenantId}", cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return dto;
    }

    private async Task SetOrUpdateConfigAsync(string key, string value, string description, CancellationToken cancellationToken)
    {
        var existing = await _systemConfigRepository.GetByKeyAsync(key, cancellationToken);
        if (existing == null)
        {
            await _systemConfigRepository.AddAsync(new SystemConfig
            {
                Key = key,
                Value = value,
                Description = description,
                Category = CategoryName,
                DataType = "String",
                IsPublic = true
            }, cancellationToken);
        }
        else
        {
            existing.Value = value;
            existing.Description = description;
            _systemConfigRepository.Update(existing);
        }
    }

    private static string ExtractCodeDigits(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return "10";
        var match = Regex.Match(code, @"\d+");
        return match.Success ? match.Value : code.Replace("RC-", "").Replace("Region", "").Trim();
    }
}
