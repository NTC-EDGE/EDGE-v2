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

    [Fact]
    public void NumberToWordsConverter_ConvertsCorrectly()
    {
        Assert.Equal("TWO HUNDRED FORTY PESOS ONLY", NumberToWordsConverter.Convert(240.00m));
        Assert.Equal("ONE THOUSAND TWO HUNDRED FIFTY PESOS AND FIFTY CENTS", NumberToWordsConverter.Convert(1250.50m));
        Assert.Equal("ZERO PESOS ONLY", NumberToWordsConverter.Convert(0m));
    }

    [Fact]
    public void OrderOfPaymentPrintMapper_MapsRealEntityToPrintModel_Successfully()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var opId = Guid.NewGuid();
        var soaId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ReferenceNumber = "REF-2026-NTC-001",
            Office = "Regional Office VII"
        };

        var soa = new Domain.Entities.StatementOfAccount
        {
            Id = soaId,
            ApplicationId = appId,
            SoaNumber = "SOA-2026-00991",
            IssuedToName = "Florito Avenido Amistad",
            IssuedToAddress = "San Vicente, Liloan, Cebu",
            TotalAmount = 240.00m,
            LineItems = new System.Collections.Generic.List<Domain.Entities.SoaLineItem>
            {
                new() { Particular = "Certificate Fee", Amount = 180.00m },
                new() { Particular = "Documentary Stamp Tax", Amount = 30.00m },
                new() { Particular = "Surcharge", Amount = 30.00m }
            }
        };

        var op = new Domain.Entities.OrderOfPayment
        {
            Id = opId,
            ApplicationId = appId,
            StatementOfAccountId = soaId,
            OpNumber = "61-2026-07-1952",
            AmountDue = 240.00m,
            Status = Domain.Enums.OpStatus.Billed
        };

        // Act
        var model = OrderOfPaymentPrintMapper.MapToPrintModel(op, soa, app);
        var report = new OrderOfPaymentReport(model);
        byte[] pdfBytes = report.GeneratePdf();

        // Assert
        Assert.Equal("Florito Avenido Amistad", model.PayorName);
        Assert.Equal("61-2026-07-1952", model.SerialNo);
        Assert.Equal("SOA-2026-00991", model.StatementOfAccountNo);
        Assert.Equal(240.00m, model.Amount);
        Assert.Equal("TWO HUNDRED FORTY PESOS ONLY", model.AmountInWords);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000);
    }

    [Fact]
    public void OrderOfPaymentAcroFormFiller_InspectTemplateFields()
    {
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        if (!File.Exists(templatePath))
        {
            templatePath = Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        }

        Assert.True(File.Exists(templatePath), $"Template should exist at {templatePath}");
        var bytes = File.ReadAllBytes(templatePath);

        using var inStream = new MemoryStream(bytes);
        using var reader = new iText.Kernel.Pdf.PdfReader(inStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var form = iText.Forms.PdfAcroForm.GetAcroForm(pdfDoc, true);
        
        var fieldNames = form.GetAllFormFields().Keys.ToList();
        // Output all field names and rectangles
        foreach (var name in fieldNames)
        {
            var field = form.GetField(name);
            var widgets = field.GetWidgets();
            foreach (var widget in widgets)
            {
                var rect = widget.GetRectangle().ToRectangle();
                Console.WriteLine($"FIELD: {name} -> Rect: [X={rect.GetX():F1}, Y={rect.GetY():F1}, W={rect.GetWidth():F1}, H={rect.GetHeight():F1}]");
            }
        }

        Assert.NotEmpty(fieldNames);
    }

    [Fact]
    public void OrderOfPaymentAcroFormFiller_Fill_CheckDuplicateText()
    {
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        if (!File.Exists(templatePath))
        {
            templatePath = Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        }

        var bytes = File.ReadAllBytes(templatePath);
        var model = MockDataFactory.GetOrderOfPaymentModel();

        var filledBytes = EDGE.Infrastructure.Printing.Services.AcroForm.OrderOfPaymentAcroFormFiller.Fill(bytes, model);
        Assert.NotNull(filledBytes);

        using var inStream = new MemoryStream(filledBytes);
        using var reader = new iText.Kernel.Pdf.PdfReader(inStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var page = pdfDoc.GetPage(1);
        var text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);

        Console.WriteLine("EXTRACTED PDF TEXT:\n" + text);

        // Assert: On a 2-up sheet (Upper voucher & Lower voucher), each field must appear exactly 2 times (never 3+ or double-printed)
        int payorCount = System.Text.RegularExpressions.Regex.Matches(text, System.Text.RegularExpressions.Regex.Escape(model.PayorName ?? string.Empty)).Count;
        Assert.Equal(2, payorCount);

        int soaCount = System.Text.RegularExpressions.Regex.Matches(text, System.Text.RegularExpressions.Regex.Escape(model.StatementOfAccountNo ?? string.Empty)).Count;
        Assert.Equal(2, soaCount);
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
