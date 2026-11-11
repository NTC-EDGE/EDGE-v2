using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
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
        var service = new FormPrintingService();
        byte[] pdfBytes = service.PrintOrderOfPayment(model);

        // Assert
        Assert.Equal("Florito Avenido Amistad", model.PayorName);
        Assert.Equal("61-2026-07-1952", model.SerialNo);
        Assert.Equal("SOA-2026-00991", model.StatementOfAccountNo);
        Assert.Equal(240.00m, model.Amount);
        Assert.Equal("TWO HUNDRED FORTY PESOS ONLY", model.AmountInWords);
        Assert.Equal("Regional Office VII", model.RegionalOffice);
        Assert.Empty(model.BankAccounts);
        Assert.Null(model.TotalAmount);
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000);

        using var inStream = new MemoryStream(pdfBytes);
        using var reader = new iText.Kernel.Pdf.PdfReader(inStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var page = pdfDoc.GetPage(1);
        var text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);
        Assert.DoesNotContain("Land Bank", text);
    }

    [Fact]
    public void OrderOfPaymentAcroFormFiller_WithOrDetails_FillsOrFields()
    {
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        if (!File.Exists(templatePath))
        {
            templatePath = Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", "order-of-payment-template.pdf");
        }

        var bytes = File.ReadAllBytes(templatePath);
        var model = MockDataFactory.GetOrderOfPaymentModel();
        model.OrNo = "OR-2026-999888";
        model.OrAmount = "P240.00";
        model.OrDate = "Jul 23 2026";
        model.OrBy = "Cashier Name";

        var filledBytes = EDGE.Infrastructure.Printing.Services.AcroForm.OrderOfPaymentAcroFormFiller.Fill(bytes, model);
        Assert.NotNull(filledBytes);

        using var inStream = new MemoryStream(filledBytes);
        using var reader = new iText.Kernel.Pdf.PdfReader(inStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var page = pdfDoc.GetPage(1);
        var text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);

        Assert.Contains("OR-2026-999888", text);
    }

    [Fact]
    public void OrderOfPaymentPrintMapper_WhenPaid_PopulatesOrBoxAndRendersInPdf()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var opId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            ReferenceNumber = "REF-2026-NTC-003",
            Status = Domain.Enums.ApplicationStatus.ForIssuance
        };

        var op = new Domain.Entities.OrderOfPayment
        {
            Id = opId,
            ApplicationId = appId,
            OpNumber = "61-2026-07-2000",
            AmountDue = 350.00m,
            Status = Domain.Enums.OpStatus.Paid,
            OfficialReceiptNumber = "OR-2026-777888",
            AmountReceived = 350.00m,
            PaidAt = new DateTime(2026, 7, 24)
        };

        // Act
        var model = OrderOfPaymentPrintMapper.MapToPrintModel(op, null, app);
        var service = new FormPrintingService();
        byte[] pdfBytes = service.PrintOrderOfPayment(model);

        // Assert
        Assert.Equal("OR-2026-777888", model.OrNo);
        Assert.Equal("P350.00", model.OrAmount);
        Assert.Contains("Jul 24 2026", model.OrDate);
        Assert.NotNull(pdfBytes);

        using var inStream = new MemoryStream(pdfBytes);
        using var reader = new iText.Kernel.Pdf.PdfReader(inStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var page = pdfDoc.GetPage(1);
        var text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);
        Assert.Contains("OR-2026-777888", text);
    }

    [Fact]
    public void OrderOfPaymentPrintMapper_WithConfiguredDepositoryAccounts_PopulatesBankAccounts()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = tenantId,
            ReferenceNumber = "REF-2026-NTC-002"
            // Office left null to verify it doesn't fallback to hardcoded string
        };

        var op = new Domain.Entities.OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = appId,
            OpNumber = "61-2026-07-1953",
            AmountDue = 500.00m
        };

        var bankAccounts = new System.Collections.Generic.List<Domain.Entities.AgencyBankAccount>
        {
            new Domain.Entities.AgencyBankAccount
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                BankName = "Development Bank of the Philippines",
                AccountNumber = "0405-123456-001",
                IsActive = true
            }
        };

        // Act
        var model = OrderOfPaymentPrintMapper.MapToPrintModel(op, null, app, null, bankAccounts);

        // Assert
        Assert.Null(model.RegionalOffice);
        Assert.Single(model.BankAccounts);
        Assert.Equal("Development Bank of the Philippines", model.BankAccounts[0].BankName);
        Assert.Equal("0405-123456-001", model.BankAccounts[0].No);
        Assert.Equal(500.00m, model.BankAccounts[0].Amount);
        Assert.Equal(500.00m, model.TotalAmount);
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

    [Fact]
    public void OrderOfPaymentPrintMapper_MultipleOfficialReceipts_AggregatesAllOrNumbersAndAmounts()
    {
        var appId = Guid.NewGuid();
        var opId = Guid.NewGuid();
        var op = new OrderOfPayment
        {
            Id = opId,
            ApplicationId = appId,
            OpNumber = "OP-2026-0001",
            AmountDue = 2000m,
            AmountReceived = 2000m,
            Status = OpStatus.Paid
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationNumber = "APP-2026-0001",
            Status = ApplicationStatus.ForIssuance,
            OrdersOfPayment = new List<OrderOfPayment> { op }
        };

        var receipt1 = new OfficialReceipt
        {
            OfficialReceiptNumber = "OR-PART-1",
            Amount = 1200m,
            IssuedAt = new DateTime(2026, 4, 1, 8, 0, 0, DateTimeKind.Utc)
        };
        var receipt2 = new OfficialReceipt
        {
            OfficialReceiptNumber = "OR-PART-2",
            Amount = 800m,
            IssuedAt = new DateTime(2026, 4, 2, 9, 0, 0, DateTimeKind.Utc)
        };

        var model = OrderOfPaymentPrintMapper.MapToPrintModel(
            op: op,
            app: app,
            receipts: new List<OfficialReceipt> { receipt1, receipt2 });

        Assert.Contains("OR-PART-1", model.OrNo);
        Assert.Contains("OR-PART-2", model.OrNo);
        Assert.Equal(2, model.OrNumbers.Count);
        Assert.Equal("P2,000.00", model.OrAmount);
    }

    [Fact]
    public void OrderOfPaymentPrintMapper_WhenReceiptIsCancelled_ExcludesCancelledReceiptNumber()
    {
        var op = new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            OpNumber = "OP-2026-0002",
            AmountDue = 1500m,
            AmountReceived = 1500m,
            Status = OpStatus.Paid
        };

        var activeReceipt = new OfficialReceipt
        {
            OfficialReceiptNumber = "OR-VALID-01",
            Amount = 1500m,
            Status = ReceiptStatus.Issued,
            IssuedAt = DateTime.UtcNow
        };

        var cancelledReceipt = new OfficialReceipt
        {
            OfficialReceiptNumber = "OR-CANCELLED-01",
            Amount = 1500m,
            Status = ReceiptStatus.Cancelled,
            CancelledAt = DateTime.UtcNow
        };

        var model = OrderOfPaymentPrintMapper.MapToPrintModel(
            op: op,
            receipts: new List<OfficialReceipt> { activeReceipt, cancelledReceipt });

        Assert.Contains("OR-VALID-01", model.OrNumbers);
        Assert.DoesNotContain("OR-CANCELLED-01", model.OrNumbers);
        Assert.Single(model.OrNumbers);
        Assert.Equal("P1,500.00", model.OrAmount);
    }
}
