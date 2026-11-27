using System;
using System.Collections.Generic;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Printing.Models;

public class StatutoryReportModel
{
    public string Code { get; set; } = "NTC-MIS-OPS";
    public string Title { get; set; } = "Monthly Regional Operational & MIS Accomplishment Report";
    public string Agency { get; set; } = "NTC Central Office (MIS / Planning)";
    public string Frequency { get; set; } = "Monthly";
    public string LegalBasis { get; set; } = "EO 546 / NTC Citizens Charter & ARTA RA 11032";
    public string TenantName { get; set; } = "NTC Regional Office";
    public string Period { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public string GeneratedBy { get; set; } = "Authorized Regional Officer";
    public string GeneratedByTitle { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string FundCluster { get; set; } = "01101101";
    public string RegionalOfficeAddress { get; set; } = string.Empty;
    public ReportSignatoriesDto Signatories { get; set; } = new();
    public string? SecondaryFilter { get; set; }
    public string? FieldOfficeFilter { get; set; }
    public IReadOnlyList<ApplicationSummaryDto> Applications { get; set; } = Array.Empty<ApplicationSummaryDto>();
    public IReadOnlyList<TenantTransactionDto> Transactions { get; set; } = Array.Empty<TenantTransactionDto>();
    public IReadOnlyList<TenantTransactionDto> PaidTransactions { get; set; } = Array.Empty<TenantTransactionDto>();
    public IReadOnlyList<OfficialReceipt> OfficialReceipts { get; set; } = Array.Empty<OfficialReceipt>();
    public IReadOnlyList<BankDeposit> BankDeposits { get; set; } = Array.Empty<BankDeposit>();
    public int FeedbackCount { get; set; }
    public double AverageCsat { get; set; } = 5.0;
}
