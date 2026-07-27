using System;
using System.IO;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using EDGE.Infrastructure.Printing.Services;
using QuestPDF.Fluent;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class OrderOfPaymentReportTests
{
    public OrderOfPaymentReportTests()
    {
        // Configure QuestPDF community license for test run
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    [Fact]
    public void GeneratePdf_BlankTemplate_ProducesValidPdfBytes()
    {
        // Arrange
        var model = new OrderOfPaymentModel();
        var report = new OrderOfPaymentReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing temp dir for inspection
        SavePdfToTemp("OrderOfPayment_BlankTemplate.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Blank Order of Payment PDF bytes should be non-empty.");
    }

    [Fact]
    public void GeneratePdf_SampleOrderOfPayment_ProducesValidPdfBytes()
    {
        // Arrange: Sample data matching Florito Avenido Amistad Order of Payment
        var model = MockDataFactory.GetOrderOfPaymentModel();
        var report = new OrderOfPaymentReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Save to testing temp dir for inspection
        SavePdfToTemp("OrderOfPayment_Sample_FloritoAmistad.pdf", pdfBytes);

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Sample Order of Payment PDF bytes should be non-empty.");
    }

    [Fact]
    public void FormPrintingService_PrintOrderOfPayment_ReturnsPdfBytes()
    {
        // Arrange
        var service = new FormPrintingService();

        // Act
        byte[] blankPdf = service.PrintOrderOfPayment();
        byte[] samplePdf = service.PrintOrderOfPayment(MockDataFactory.GetOrderOfPaymentModel());

        // Assert
        Assert.NotNull(blankPdf);
        Assert.True(blankPdf.Length > 1000);
        Assert.NotNull(samplePdf);
        Assert.True(samplePdf.Length > 1000);
    }

    private static void SavePdfToTemp(string filename, byte[] bytes)
    {
        string tempDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Temp");
        if (Directory.Exists(tempDir))
        {
            File.WriteAllBytes(Path.Combine(tempDir, filename), bytes);
        }
    }
}
