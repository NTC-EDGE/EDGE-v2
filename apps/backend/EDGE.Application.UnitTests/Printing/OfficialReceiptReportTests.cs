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

    [Fact]
    public void OfficialReceiptPrintMapper_MapsEntities_AndFillsAcroFormSuccessfully()
    {
        // Arrange
        var receipt = new EDGE.Domain.Entities.OfficialReceipt
        {
            Id = System.Guid.NewGuid(),
            OfficialReceiptNumber = "OR-2026-999999",
            PayorName = "NTC Radio Station Inc.",
            Amount = 1500m,
            PaymentMethod = EDGE.Domain.Enums.PaymentMethod.Cash,
            IssuedAt = System.DateTime.UtcNow,
            LineItems = new List<EDGE.Domain.Entities.OfficialReceiptLineItem>
            {
                new() { FeeCode = "LIC", Description = "Radio Station License", Amount = 1200m },
                new() { FeeCode = "DST", Description = "Documentary Stamp Tax", Amount = 300m }
            }
        };

        var op = new EDGE.Domain.Entities.OrderOfPayment
        {
            Id = System.Guid.NewGuid(),
            OpNumber = "OP-2026-000123",
            AmountDue = 1500m,
            AmountReceived = 1500m,
            OfficialReceiptNumber = "OR-2026-999999",
            Status = EDGE.Domain.Enums.OpStatus.Paid
        };

        // Act
        var model = OfficialReceiptPrintMapper.MapToPrintModel(receipt: receipt, op: op);

        // Assert
        Assert.NotNull(model);
        Assert.Equal("OR-2026-999999", model.ReceiptNo);
        Assert.Equal("NTC Radio Station Inc.", model.Payor);
        Assert.Equal(1500m, model.TotalAmount);
        Assert.Equal(2, model.Items.Count);
        Assert.Equal(PaymentType.Cash, model.SelectedPaymentType);

        var service = new FormPrintingService();
        var pdfBytes = service.PrintOfficialReceipt(model);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 10000, "Filled OR AcroForm should produce substantial PDF bytes.");
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

