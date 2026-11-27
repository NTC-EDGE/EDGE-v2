using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.AcroForm;
using iText.Forms;
using iText.Kernel.Pdf;
using Microsoft.Extensions.Logging;
using Xunit;
using Xunit.Abstractions;

namespace EDGE.Application.UnitTests.Printing;

public class TempDiagTests
{
    private readonly ITestOutputHelper _output;

    public TempDiagTests(ITestOutputHelper output) => _output = output;

    private class CaptureLogger<T> : ILogger<T>
    {
        public List<string> Messages { get; } = new();
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            Messages.Add($"[{logLevel}] {formatter(state, exception)} {(exception != null ? "EX: " + exception.GetType().Name + ": " + exception.Message : "")}");
        }
    }

    [Fact]
    public void Diagnose_All16Forms_And_SoaTemplate()
    {
        var logger = new CaptureLogger<FormPrintingService>();
        var filler = new PdfFormFillerService();
        var svc = new FormPrintingService(filler, logger);

        var forms = new (string Name, Func<byte[]> Print)[]
        {
            ("NTC 1-01", () => svc.PrintNtc101(MockDataFactory.GetNtc101Application())),
            ("NTC 1-02", () => svc.PrintNtc102(MockDataFactory.GetNtc102Application())),
            ("NTC 1-03", () => svc.PrintNtc103(MockDataFactory.GetNtc103Application())),
            ("NTC 1-04", () => svc.PrintNtc104(MockDataFactory.GetNtc104Application())),
            ("NTC 1-05", () => svc.PrintNtc105(MockDataFactory.GetNtc105Application())),
            ("NTC 1-09", () => svc.PrintPurchasePossessSellTransfer(MockDataFactory.GetPurchasePossessSellTransferApplication())),
            ("NTC 1-10", () => svc.PrintNtc110(MockDataFactory.GetNtc110Application())),
            ("NTC 1-11", () => svc.PrintConstructionPermit(MockDataFactory.GetConstructionPermitApplication())),
            ("NTC 1-14", () => svc.PrintNtc114(MockDataFactory.GetNtc114Application())),
            ("NTC 1-18", () => svc.PrintNtc118(MockDataFactory.GetNtc118Application())),
            ("NTC 1-19", () => svc.PrintCertificateOfRegistration(MockDataFactory.GetCertificateOfRegistrationApplication())),
            ("NTC 1-20", () => svc.PrintNtc120(MockDataFactory.GetNtc120Application())),
            ("NTC 1-21", () => svc.PrintNtc121(new Ntc121Application { ApplicationId = Guid.NewGuid() })),
            ("NTC 1-22", () => svc.PrintNtc122(new Ntc122Application { ApplicationId = Guid.NewGuid() })),
            ("NTC 1-24", () => svc.PrintNtc124(new Ntc124Application { ApplicationId = Guid.NewGuid(), AffiantName = "JUAN DELA CRUZ" })),
            ("NTC 1-25", () => svc.PrintNtc125(new Ntc125Application { ApplicationId = Guid.NewGuid(), StateBrieflyDetails = "Test complaint" })),
        };

        var scratchDir = @"C:\Users\User\.gemini\antigravity\brain\f4d3029c-5eb6-44b0-ae06-6684db00fb36\scratch";
        Directory.CreateDirectory(scratchDir);

        foreach (var (name, print) in forms)
        {
            logger.Messages.Clear();
            var bytes = print();
            var isQuestPdf = Encoding.ASCII.GetString(bytes).Contains("QuestPDF");
            _output.WriteLine($"{name,-10} | len={bytes.Length,8} | QuestPDF={isQuestPdf,-5} | logs={string.Join(" ; ", logger.Messages)}");
            if (name == "NTC 1-01" || name == "NTC 1-11")
            {
                File.WriteAllBytes(Path.Combine(scratchDir, $"{name.Replace(" ", "_").ToLowerInvariant()}_diag.pdf"), bytes);
            }
        }

        // Inspect SOA template AcroForm fields
        var soaTemplatePath = @"c:\Dev\NEXTSTEP\EDGE-v2\apps\backend\EDGE.Infrastructure\Printing\Templates\soa-report-template.pdf";
        var soaTemplateBytes = File.ReadAllBytes(soaTemplatePath);
        _output.WriteLine("=== SOA ACROFORM FIELDS ===");
        using (var ms = new MemoryStream(soaTemplateBytes))
        using (var reader = new PdfReader(ms))
        using (var pdfDoc = new PdfDocument(reader))
        {
            var form = PdfAcroForm.GetAcroForm(pdfDoc, false);
            foreach (var kv in form.GetAllFormFields())
            {
                var k = kv.Key;
                var f = kv.Value;
                var ft = f.GetFormType()?.GetValue();
                if (k.Contains("Prep", StringComparison.OrdinalIgnoreCase) ||
                    k.Contains("Appr", StringComparison.OrdinalIgnoreCase) ||
                    k.Contains("Sign", StringComparison.OrdinalIgnoreCase) ||
                    k.Contains("Account", StringComparison.OrdinalIgnoreCase) ||
                    k.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                    k.Contains("Eval", StringComparison.OrdinalIgnoreCase) ||
                    ft != "Tx")
                {
                    var widgets = f.GetWidgets();
                    var wInfo = string.Join(", ", widgets.Select(w =>
                    {
                        var r = w.GetRectangle().ToRectangle();
                        var mk = w.GetPdfObject().GetAsDictionary(PdfName.MK);
                        var bg = mk?.Get(PdfName.BG)?.ToString() ?? "none";
                        var bc = mk?.Get(PdfName.BC)?.ToString() ?? "none";
                        var ap = w.GetPdfObject().GetAsDictionary(PdfName.AP) != null;
                        return $"[{r.GetX():F1},{r.GetY():F1},{r.GetWidth():F1}x{r.GetHeight():F1} BG={bg} BC={bc} AP={ap}]";
                    }));
                    _output.WriteLine($"FIELD {k} | FT={ft} | Widgets={wInfo}");
                }
            }
        }

        // Render SOA preview
        var soaModel = MockDataFactory.GetStatementOfAccountModel();
        var soaFilled = StatementOfAccountAcroFormFiller.Fill(soaTemplateBytes, soaModel);
        File.WriteAllBytes(Path.Combine(scratchDir, "soa_acroform_preview.pdf"), soaFilled);
    }
}
