using System.Collections.Generic;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using EDGE.Infrastructure.Printing.Services;
using QuestPDF.Fluent;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class OfficialReceiptReportTests
{
    public OfficialReceiptReportTests()
    {
        // Configure QuestPDF community license for test run
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    [Fact]
    public void GeneratePdf_Portrait_BlankTemplate_ProducesValidPdfBytes()
    {
        // Arrange
        var model = new OfficialReceiptModel { Orientation = ReceiptOrientation.Portrait };
        var report = new OfficialReceiptReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing outputdir for inspection
        SavePdfToTemp("OfficialReceipt_Portrait_BlankTemplate.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Portrait blank PDF bytes should be non-empty.");
    }

    [Fact]
    public void GeneratePdf_Portrait_SampleReceipt_ProducesValidPdfBytes()
    {
        // Arrange: Sample data matching Official Receipt #1521324
        var model = MockDataFactory.GetOfficialReceiptModel();
        var report = new OfficialReceiptReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing outputdir for inspection
        SavePdfToTemp("OfficialReceipt_Portrait_Sample_1521324.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Portrait sample PDF bytes should be non-empty.");
    }

    [Fact]
    public void GeneratePdf_Landscape_BlankTemplate_ProducesValidPdfBytes()
    {
        // Arrange
        var model = new OfficialReceiptModel { Orientation = ReceiptOrientation.Landscape };
        var report = new OfficialReceiptReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing outputdir for inspection
        SavePdfToTemp("OfficialReceipt_Landscape_BlankTemplate.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Landscape blank PDF bytes should be non-empty.");
    }

    [Fact]
    public void GeneratePdf_Landscape_SampleReceipt_ProducesValidPdfBytes()
    {
        // Arrange: Sample data matching Official Receipt #1497771 (John Rabbi Buen Salem)
        var model = MockDataFactory.GetOfficialReceiptLandscapeModel();
        var report = new OfficialReceiptReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing outputdir for inspection
        SavePdfToTemp("OfficialReceipt_Landscape_Sample_1497771.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Landscape sample PDF bytes should be non-empty.");
    }

    [Fact]
    public void FormPrintingService_PrintOfficialReceipt_ReturnsPdfBytes()
    {
        // Arrange
        var service = new FormPrintingService();

        // Act
        byte[] portraitBlank = service.PrintOfficialReceipt();
        byte[] landscapeBlank = service.PrintOfficialReceipt(new OfficialReceiptModel { Orientation = ReceiptOrientation.Landscape });
        byte[] landscapeSample = service.PrintOfficialReceipt(MockDataFactory.GetOfficialReceiptLandscapeModel());

        // Assert
        Assert.NotNull(portraitBlank);
        Assert.True(portraitBlank.Length > 1000);
        Assert.NotNull(landscapeBlank);
        Assert.True(landscapeBlank.Length > 1000);
        Assert.NotNull(landscapeSample);
        Assert.True(landscapeSample.Length > 1000);
    }

    private static void SavePdfToTemp(string filename, byte[] bytes)
    {
        string tempDir = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Temp");
        if (System.IO.Directory.Exists(tempDir))
        {
            System.IO.File.WriteAllBytes(System.IO.Path.Combine(tempDir, filename), bytes);
        }
    }
}
