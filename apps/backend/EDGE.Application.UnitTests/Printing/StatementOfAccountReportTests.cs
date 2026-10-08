using System.IO;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using EDGE.Infrastructure.Printing.Services;
using QuestPDF.Fluent;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class StatementOfAccountReportTests
{
    public StatementOfAccountReportTests()
    {
        // Configure QuestPDF community license for test run
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        QuestPDF.Settings.EnableDebugging = true;
    }


    [Fact]
    public void GeneratePdf_BlankTemplate_ProducesValidPdfBytes()
    {
        // Arrange
        var model = new StatementOfAccountModel();
        var report = new StatementOfAccountReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing temp dir for inspection
        SavePdfToTemp("StatementOfAccount_BlankTemplate.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Blank Statement of Account PDF bytes should be non-empty.");
    }

    [Fact]
    public void GeneratePdf_Sample_DezzaCollection_ProducesValidPdfBytes()
    {
        // Arrange
        var model = MockDataFactory.GetStatementOfAccountModel();
        var report = new StatementOfAccountReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing temp dir for inspection
        SavePdfToTemp("StatementOfAccount_Sample_TEMP-ROXIV-14148-26.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Sample Statement of Account PDF bytes should be non-empty.");
    }

    [Fact]
    public void FormPrintingService_PrintStatementOfAccount_ReturnsPdfBytes()
    {
        // Arrange
        var service = new FormPrintingService();

        // Act
        byte[] blankPdf = service.PrintStatementOfAccount();
        byte[] samplePdf = service.PrintStatementOfAccount(MockDataFactory.GetStatementOfAccountModel());

        // Assert
        Assert.NotNull(blankPdf);
        Assert.True(blankPdf.Length > 1000);
        Assert.NotNull(samplePdf);
        Assert.True(samplePdf.Length > 1000);
    }

    [Fact]
    public void StatementOfAccountPrintMapper_MapsRealEntityToPrintModel_Successfully()
    {
        // Arrange
        var appId = System.Guid.NewGuid();
        var soaId = System.Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            ReferenceNumber = "REF-2026-NTC-001",
            Intent = Domain.Enums.ApplicationIntent.Regular,
            Status = Domain.Enums.ApplicationStatus.PendingPayment
        };

        var soa = new Domain.Entities.StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            SoaNumber = "SOA-2026-00991",
            IssuedToName = "Northern Telecoms Inc.",
            DueDate = System.DateTime.UtcNow.AddDays(30),
            Status = Domain.Enums.SoaStatus.Approved,
            TotalAmount = 3500.00m,
            LineItems = new System.Collections.Generic.List<Domain.Entities.SoaLineItem>
            {
                new() { ItemCode = "4-02-01-010", Particular = "Permit to Purchase", Amount = 500.00m, ValidityYears = 1, NoOfUnits = 1 },
                new() { ItemCode = "4-02-01-060", Particular = "Radio Station License", Amount = 2400.00m, ValidityYears = 2, NoOfUnits = 1 },
                new() { ItemCode = "4-01-04-010", Particular = "Documentary Stamp Tax (DST)", Amount = 30.00m, ValidityYears = 0, NoOfUnits = 1 },
                new() { ItemCode = "9-99-99-999", Particular = "Custom Special Processing", Amount = 570.00m, ValidityYears = 1, NoOfUnits = 1 }
            }
        };

        // Act
        var model = StatementOfAccountPrintMapper.MapToPrintModel(soa, app);
        var report = new StatementOfAccountReport(model);
        byte[] pdfBytes = report.GeneratePdf();

        // Assert
        Assert.Equal("Northern Telecoms Inc.", model.PayorName);
        Assert.Equal("SOA-2026-00991", model.AccountNo);
        Assert.True(model.IsEndorsedForPayment);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000);
    }

    private static void SavePdfToTemp(string filename, byte[] bytes)
    {
        string tempDir = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Temp");
        if (Directory.Exists(tempDir))
        {
            File.WriteAllBytes(Path.Combine(tempDir, filename), bytes);
        }
    }
}

