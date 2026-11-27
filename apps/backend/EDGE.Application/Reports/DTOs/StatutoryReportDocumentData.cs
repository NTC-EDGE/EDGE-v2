using System;
using System.Collections.Generic;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;

namespace EDGE.Application.Reports.DTOs;

/// <summary>
/// Application-layer data contract passed to <see cref="IStatutoryReportPdfGenerator"/>
/// so the Application layer stays decoupled from QuestPDF / Infrastructure printing models.
/// </summary>
public sealed class StatutoryReportDocumentData
{
    public string Code { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Agency { get; init; } = string.Empty;
    public string Frequency { get; init; } = string.Empty;
    public string LegalBasis { get; init; } = string.Empty;
    public string TenantName { get; init; } = string.Empty;
    public string Period { get; init; } = string.Empty;
    public string StartDate { get; init; } = string.Empty;
    public string EndDate { get; init; } = string.Empty;
    public string GeneratedBy { get; init; } = string.Empty;
    public string GeneratedByTitle { get; init; } = string.Empty;
    public DateTime GeneratedAt { get; init; } = DateTime.UtcNow;
    public string FundCluster { get; init; } = string.Empty;
    public string ResponsibilityCenterCode { get; init; } = string.Empty;
    public string MfoPapCode { get; init; } = string.Empty;
    public string RegionalOfficeAddress { get; init; } = string.Empty;
    public ReportSignatoriesDto Signatories { get; init; } = new();
    public string? SecondaryFilter { get; init; }
    public string? FieldOfficeFilter { get; init; }
    public IReadOnlyList<ApplicationSummaryDto> Applications { get; init; } = Array.Empty<ApplicationSummaryDto>();
    public IReadOnlyList<TenantTransactionDto> Transactions { get; init; } = Array.Empty<TenantTransactionDto>();
    public IReadOnlyList<TenantTransactionDto> PaidTransactions { get; init; } = Array.Empty<TenantTransactionDto>();
    public IReadOnlyList<OfficialReceipt> OfficialReceipts { get; init; } = Array.Empty<OfficialReceipt>();
    public IReadOnlyList<BankDeposit> BankDeposits { get; init; } = Array.Empty<BankDeposit>();
    public int FeedbackCount { get; init; }
    public double AverageCsat { get; init; } = 5.0;
}

public sealed record StatutoryReportPdfResult(
    byte[] PdfBytes,
    string FileName);
