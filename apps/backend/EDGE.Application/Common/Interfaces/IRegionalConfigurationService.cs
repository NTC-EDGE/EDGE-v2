using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public class ReportSignatoriesDto
{
    public string RegionalDirectorName { get; set; } = string.Empty;
    public string RegionalDirectorTitle { get; set; } = "Regional Director";
    public string ChiefEodName { get; set; } = string.Empty;
    public string ChiefEodTitle { get; set; } = "Chief, Enforcement & Operations Division";
    public string RegionalAccountantName { get; set; } = string.Empty;
    public string RegionalAccountantTitle { get; set; } = "Regional Accountant III";
    public string CollectingOfficerName { get; set; } = string.Empty;
    public string CollectingOfficerTitle { get; set; } = "Collecting Officer / Regional Cashier III";
    public string MisOfficerName { get; set; } = string.Empty;
    public string MisOfficerTitle { get; set; } = "MIS / Planning Officer";
    public string ExamProctorName { get; set; } = string.Empty;
    public string ExamProctorTitle { get; set; } = "Authorized Examination Proctor";
}

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
    public bool AllowManualSoaNumber { get; set; }
    public bool AllowManualOpNumber { get; set; }
    public bool EnableInternalEmailNotifications { get; set; } = true;
    public ReportSignatoriesDto? ReportSignatories { get; set; }
}

public interface IRegionalConfigurationService
{
    Task<RegionalConfigurationDto> GetConfigurationAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<RegionalConfigurationDto> UpdateConfigurationAsync(RegionalConfigurationDto dto, CancellationToken cancellationToken = default);
    Task<RegionalConfigurationDto> UpdateNumberingModeAsync(
        Guid tenantId,
        bool allowManualSoaNumber,
        bool allowManualOpNumber,
        string? rcCodeSoa = null,
        string? rcCodeOp = null,
        CancellationToken cancellationToken = default);
}
