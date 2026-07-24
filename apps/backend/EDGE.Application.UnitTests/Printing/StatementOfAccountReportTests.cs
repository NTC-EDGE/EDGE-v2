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

    private static void SavePdfToTemp(string filename, byte[] bytes)
    {
        string tempDir = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Temp");
        if (Directory.Exists(tempDir))
        {
            File.WriteAllBytes(Path.Combine(tempDir, filename), bytes);
        }
    }
}
