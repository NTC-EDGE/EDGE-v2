using System.IO;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.Templates;
using QuestPDF.Fluent;
using Xunit;
using Xunit.Abstractions;

namespace EDGE.Application.UnitTests.Printing;

public class StatementOfAccountReportTests
{
    private readonly ITestOutputHelper _output;

    public StatementOfAccountReportTests(ITestOutputHelper output)
    {
        _output = output;
        // Configure QuestPDF community license for test run
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
        QuestPDF.Settings.EnableDebugging = true;
    }

    [Fact]
    public async System.Threading.Tasks.Task AllThree_AcroFormTemplates_FillAndFlattenSuccessfully()
    {
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            null);

        // 1. Test filling Statement of Account AcroForm
        var soaResource = await provider.GetTemplateResourceAsync("soa-report-template.pdf");
        Assert.NotNull(soaResource);
        using (var inMs = new MemoryStream())
        {
            await soaResource!.Stream.CopyToAsync(inMs);
            var soaTemplateBytes = inMs.ToArray();

            var soaModel = MockDataFactory.GetStatementOfAccountModel();
            var filledSoaBytes = EDGE.Infrastructure.Printing.Services.AcroForm.StatementOfAccountAcroFormFiller.Fill(soaTemplateBytes, soaModel);

            Assert.NotNull(filledSoaBytes);
            Assert.True(filledSoaBytes.Length > 10000, "Filled SOA AcroForm should be substantial in size");
            _output.WriteLine($"Successfully filled and flattened SOA! Output size: {filledSoaBytes.Length} bytes");
        }

        // 2. Test filling Order of Payment AcroForm
        var opBytes = await provider.GetTemplateResourceAsync("order-of-payment-template.pdf");
        Assert.NotNull(opBytes);
        using (var inMs = new MemoryStream())
        {
            await opBytes!.Stream.CopyToAsync(inMs);
            var opTemplateBytes = inMs.ToArray();

            var opModel = MockDataFactory.GetOrderOfPaymentModel();
            var filledOpBytes = EDGE.Infrastructure.Printing.Services.AcroForm.OrderOfPaymentAcroFormFiller.Fill(opTemplateBytes, opModel);

            // Extract text from raw template
            using var textReader = new iText.Kernel.Pdf.PdfReader(new MemoryStream(opTemplateBytes));
            using var textDoc = new iText.Kernel.Pdf.PdfDocument(textReader);
            var page = textDoc.GetPage(1);
            var text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page);
            _output.WriteLine($"OP TEMPLATE RAW TEXT:\n{text}");

            var inspectForm = iText.Forms.PdfAcroForm.GetAcroForm(textDoc, false);
            if (inspectForm != null)
            {
                foreach (var field in inspectForm.GetAllFormFields().OrderBy(f => f.Key))
                {
                    var widgets = field.Value.GetWidgets();
                    var rect = widgets.Count > 0 ? widgets[0].GetRectangle().ToRectangle() : null;
                    _output.WriteLine($"OP FIELD: {field.Key,-25} | Rect: [x={rect?.GetX():F1}, y={rect?.GetY():F1}, w={rect?.GetWidth():F1}, h={rect?.GetHeight():F1}]");
                }
            }

            Assert.NotNull(filledOpBytes);
            Assert.True(filledOpBytes.Length > 10000, "Filled OP AcroForm should be substantial in size");
            _output.WriteLine($"Successfully filled and flattened OP! Output size: {filledOpBytes.Length} bytes");
        }

        // 3. Test filling Official Receipt AcroForm
        var orBytes = await provider.GetTemplateResourceAsync("or_portrait-template.pdf");
        Assert.NotNull(orBytes);
        using (var inMs = new MemoryStream())
        {
            await orBytes!.Stream.CopyToAsync(inMs);
            var orTemplateBytes = inMs.ToArray();

            var orModel = MockDataFactory.GetOfficialReceiptModel();
            var filledOrBytes = EDGE.Infrastructure.Printing.Services.AcroForm.OfficialReceiptAcroFormFiller.Fill(orTemplateBytes, orModel);

            Assert.NotNull(filledOrBytes);
            Assert.True(filledOrBytes.Length > 10000, "Filled OR AcroForm should be substantial in size");
            _output.WriteLine($"Successfully filled and flattened OR! Output size: {filledOrBytes.Length} bytes");
        }
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

    [Fact]
    public void GeneratePdf_OverlayMode_ProducesValidPdfBytes()
    {
        // Arrange
        var model = MockDataFactory.GetStatementOfAccountModel();
        model.IsAccountableFormOverlay = true;
        var report = new StatementOfAccountReport(model);

        // Act
        byte[] pdfBytes = report.GeneratePdf();

        // Assert
        Assert.NotNull(pdfBytes);
        Assert.True(pdfBytes.Length > 1000, "Overlay mode PDF bytes should be non-empty.");
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

