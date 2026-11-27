using EDGE.Application.Common.Interfaces;
using EDGE.Application.Reports.DTOs;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

public sealed class StatutoryReportPdfGenerator : IStatutoryReportPdfGenerator
{
    private readonly IFormPrintingService _printingService;

    public StatutoryReportPdfGenerator(IFormPrintingService printingService)
    {
        _printingService = printingService;
    }

    public byte[] GeneratePdf(StatutoryReportDocumentData data)
    {
        var model = new StatutoryReportModel
        {
            Code = data.Code,
            Title = data.Title,
            Agency = data.Agency,
            Frequency = data.Frequency,
            LegalBasis = data.LegalBasis,
            TenantName = data.TenantName,
            Period = data.Period,
            StartDate = data.StartDate,
            EndDate = data.EndDate,
            GeneratedBy = data.GeneratedBy,
            GeneratedByTitle = data.GeneratedByTitle,
            GeneratedAt = data.GeneratedAt,
            FundCluster = data.FundCluster,
            ResponsibilityCenterCode = data.ResponsibilityCenterCode,
            MfoPapCode = data.MfoPapCode,
            RegionalOfficeAddress = data.RegionalOfficeAddress,
            Signatories = data.Signatories,
            SecondaryFilter = data.SecondaryFilter,
            FieldOfficeFilter = data.FieldOfficeFilter,
            Applications = data.Applications,
            Transactions = data.Transactions,
            PaidTransactions = data.PaidTransactions,
            OfficialReceipts = data.OfficialReceipts,
            BankDeposits = data.BankDeposits,
            FeedbackCount = data.FeedbackCount,
            AverageCsat = data.AverageCsat
        };

        return _printingService.PrintStatutoryReport(model);
    }
}
