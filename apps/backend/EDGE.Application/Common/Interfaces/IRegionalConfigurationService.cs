using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public class RegionalConfigurationDto
{
    public Guid TenantId { get; set; }
    public Guid? RegionId { get; set; }
    public string TenantCode { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string RcCodeSoa { get; set; } = "61";
    public string RcCodeOp { get; set; } = "61";
    public string FundCluster { get; set; } = "01";
    public string RequestAndComplaintRouting { get; set; } = "DirectToLegal";
    public string SupportEmail { get; set; } = "region10@ntc.gov.ph";
    public string SupportPhone { get; set; } = "(088) 856-1234";
}

public interface IRegionalConfigurationService
{
    Task<RegionalConfigurationDto> GetConfigurationAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<RegionalConfigurationDto> UpdateConfigurationAsync(RegionalConfigurationDto dto, CancellationToken cancellationToken = default);
}
