using System;
using Microsoft.Extensions.Logging;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using QuestPDF.Fluent;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Entry point EDGE.Api (or EDGE.Application) calls to render a filled
/// NTC form to PDF bytes. Supports hybrid execution:
/// 1. Flat PDF template coordinate overlay via IPdfFormFillerService (if template exists).
/// 2. Code-driven vector document generation via QuestPDF (if no template uploaded).
/// </summary>
public interface IFormPrintingService
{
    byte[] PrintConstructionPermit(ConstructionPermitApplication application);
    byte[] PrintPurchasePossessSellTransfer(PurchasePossessSellTransferApplication application);
    byte[] PrintCertificateOfRegistration(CertificateOfRegistrationApplication application);
    byte[] PrintNtc101(Ntc101Application application);
    byte[] PrintNtc102(Ntc102Application application);
    byte[] PrintNtc103(Ntc103Application application);
    byte[] PrintNtc104(Ntc104Application application);
    byte[] PrintNtc105(Ntc105Application application);
    byte[] PrintNtc110(Ntc110Application application);
    byte[] PrintNtc114(Ntc114Application application);
    byte[] PrintNtc118(Ntc118Application application);
    byte[] PrintNtc120(Ntc120Application application);
    byte[] PrintNtc121(Ntc121Application application);
    byte[] PrintNtc122(Ntc122Application application);
    byte[] PrintNtc124(Ntc124Application application);
    byte[] PrintNtc125(Ntc125Application application);
    byte[] PrintOfficialReceipt(OfficialReceiptModel? model = null);
    byte[] PrintOrderOfPayment(OrderOfPaymentModel? model = null);
    byte[] PrintStatementOfAccount(StatementOfAccountModel? model = null);
    byte[] PrintIssuedDocument(IssuedDocumentModel? model = null);
    byte[] PrintIssuedDocuments(IReadOnlyList<IssuedDocumentModel> models);
    byte[] PrintStatutoryReport(StatutoryReportModel model);
}

public class FormPrintingService : IFormPrintingService
{
    private readonly IPdfFormFillerService? _fillerService;
    private readonly ILogger<FormPrintingService>? _logger;

    public FormPrintingService(
        IPdfFormFillerService? fillerService = null,
        ILogger<FormPrintingService>? logger = null)
    {
        _fillerService = fillerService;
        _logger = logger;

        // QuestPDF Community license
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    public byte[] PrintConstructionPermit(ConstructionPermitApplication application)
    {
        application ??= new ConstructionPermitApplication();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-11.pdf"],
            () => Ntc111FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-11");
        return overlaid ?? new ConstructionPermitReport(application).GeneratePdf();
    }

    public byte[] PrintPurchasePossessSellTransfer(PurchasePossessSellTransferApplication application)
    {
        application ??= new PurchasePossessSellTransferApplication();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-09.pdf"],
            () => Ntc109FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-09");
        return overlaid ?? new PurchasePossessSellTransferReport(application).GeneratePdf();
    }

    public byte[] PrintCertificateOfRegistration(CertificateOfRegistrationApplication application)
    {
        application ??= new CertificateOfRegistrationApplication();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-19.pdf"],
            () => Ntc119FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-19");
        return overlaid ?? new CertificateOfRegistrationReport(application).GeneratePdf();
    }

    public byte[] PrintNtc101(Ntc101Application application)
    {
        application ??= new Ntc101Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-01.pdf"],
            () => Ntc101FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-01");
        return overlaid ?? new Ntc101Report(application).GeneratePdf();
    }

    public byte[] PrintNtc102(Ntc102Application application)
    {
        application ??= new Ntc102Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-02.pdf"],
            () => Ntc102FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-02");
        return overlaid ?? new Ntc102Report(application).GeneratePdf();
    }

    public byte[] PrintNtc103(Ntc103Application application)
    {
        application ??= new Ntc103Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-03.pdf"],
            () => Ntc103FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-03");
        return overlaid ?? new Ntc103Report(application).GeneratePdf();
    }

    public byte[] PrintNtc104(Ntc104Application application)
    {
        application ??= new Ntc104Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-04.pdf"],
            () => Ntc104FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-04");
        return overlaid ?? new Ntc104Report(application).GeneratePdf();
    }

    public byte[] PrintNtc105(Ntc105Application application)
    {
        application ??= new Ntc105Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-05.pdf"],
            () => Ntc105FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-05");
        if (overlaid != null) return overlaid;

        // Fallback: Use NTC 1-01 report structure when template is unavailable
        return new Ntc101Report(new Ntc101Application
        {
            ApplicationId = application.ApplicationId,
            Declaration = application.Declaration
        }).GeneratePdf();
    }

    public byte[] PrintNtc110(Ntc110Application application)
    {
        application ??= new Ntc110Application();

        // Use flat PDF overlay when entries fit within the template's 4-column layout (<= 4 entries).
        // For larger entry lists (> 4 entries), switch to dynamic multi-page QuestPDF document generation.
        if ((application.Entries?.Count ?? 0) <= 4)
        {
            var overlaid = TryRenderFlatOverlayTemplate(
                ["ntc-1-10.pdf"],
                () => Ntc110FlatPdfOverlayMapper.MapToFieldOverlays(application),
                "NTC 1-10");
            if (overlaid != null) return overlaid;
        }

        // Code-driven QuestPDF generator for flexible multi-page output
        return new Ntc110Report(application).GeneratePdf();
    }

    public byte[] PrintNtc114(Ntc114Application application)
    {
        application ??= new Ntc114Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-14.pdf"],
            () => Ntc114FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-14");
        return overlaid ?? new Ntc114Report(application).GeneratePdf();
    }

    public byte[] PrintNtc118(Ntc118Application application)
    {
        application ??= new Ntc118Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-18.pdf"],
            () => Ntc118FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-18");
        return overlaid ?? new Ntc118Report(application).GeneratePdf();
    }

    public byte[] PrintNtc120(Ntc120Application application)
    {
        application ??= new Ntc120Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-20.pdf"],
            () => Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-20");
        return overlaid ?? new Ntc120Report(application).GeneratePdf();
    }

    public byte[] PrintNtc121(Ntc121Application application)
    {
        application ??= new Ntc121Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-21.pdf"],
            () => Ntc121FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-21");
        return overlaid ?? new Ntc121Report(application).GeneratePdf();
    }

    public byte[] PrintNtc122(Ntc122Application application)
    {
        application ??= new Ntc122Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["ntc-1-22.pdf"],
            () => Ntc122FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-22");
        return overlaid ?? new Ntc122Report(application).GeneratePdf();
    }

    public byte[] PrintNtc124(Ntc124Application application)
    {
        application ??= new Ntc124Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["NTC1-24.pdf", "ntc-1-24.pdf", "NTC1-24", "NTC24", "ntc24.pdf"],
            () => Ntc124FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-24");
        return overlaid ?? new Ntc124Report(application).GeneratePdf();
    }

    public byte[] PrintNtc125(Ntc125Application application)
    {
        application ??= new Ntc125Application();
        var overlaid = TryRenderFlatOverlayTemplate(
            ["NTC1-25.pdf", "ntc-1-25.pdf", "NTC1-25", "NTC25", "ntc25.pdf"],
            () => Ntc125FlatPdfOverlayMapper.MapToFieldOverlays(application),
            "NTC 1-25");
        return overlaid ?? new Ntc125Report(application).GeneratePdf();
    }

    private byte[]? TryRenderFlatOverlayTemplate(
        string[] templateCandidates,
        Func<IReadOnlyList<FieldOverlay>> buildOverlays,
        string formLabel)
    {
        IReadOnlyList<FieldOverlay> overlays;
        try
        {
            overlays = buildOverlays() ?? Array.Empty<FieldOverlay>();
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Failed to build field overlays for {FormLabel}. Rendering official NTC template without overlays.", formLabel);
            overlays = Array.Empty<FieldOverlay>();
        }

        // 1. Try cloud / configured filler service template first
        if (_fillerService != null)
        {
            foreach (var candidate in templateCandidates)
            {
                byte[]? cloudTemplate = null;
                try
                {
                    if (_fillerService.TemplateExists(candidate))
                    {
                        cloudTemplate = _fillerService.GetTemplate(candidate);
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to retrieve {FormLabel} template candidate '{Candidate}' from filler service.", formLabel, candidate);
                }

                if (cloudTemplate == null || cloudTemplate.Length == 0) continue;

                var renderedCloud = TryOverlayWithFallbackRenderer(cloudTemplate, overlays, _fillerService, formLabel, candidate);
                if (renderedCloud != null) return renderedCloud;
            }
        }

        // 2. Always fall back to the bundled official NTC PDF template (local disk or embedded assembly resource)
        //    before ever considering a non-NTC QuestPDF generator.
        foreach (var candidate in templateCandidates)
        {
            if (!candidate.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase)) continue;

            byte[]? bundledTemplate = null;
            try
            {
                bundledTemplate = LoadLocalOrEmbeddedTemplate(candidate);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to load local/embedded {FormLabel} template '{Candidate}'.", formLabel, candidate);
            }

            if (bundledTemplate == null || bundledTemplate.Length == 0) continue;

            // Use direct OverlayPdfRenderer directly so a failing/mocked _fillerService never breaks bundled official templates
            var renderedBundled = TryOverlayWithFallbackRenderer(bundledTemplate, overlays, fillerService: null, formLabel, candidate);
            if (renderedBundled != null) return renderedBundled;

            // Even if overlay drawing somehow fails completely, return the official NTC template itself rather than a non-NTC form
            return bundledTemplate;
        }

        return null;
    }

    private byte[]? TryOverlayWithFallbackRenderer(
        byte[] templateBytes,
        IReadOnlyList<FieldOverlay> overlays,
        IPdfFormFillerService? fillerService,
        string formLabel,
        string candidate)
    {
        if (fillerService != null)
        {
            try
            {
                return fillerService.OverlayFields(templateBytes, overlays);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Filler service OverlayFields failed for {FormLabel} ('{Candidate}'). Retrying with direct OverlayPdfRenderer.", formLabel, candidate);
            }
        }

        try
        {
            return OverlayOnTemplate(templateBytes, overlays, fillerService: null);
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Direct OverlayPdfRenderer failed for {FormLabel} ('{Candidate}').", formLabel, candidate);
            return null;
        }
    }

    public byte[] PrintOfficialReceipt(OfficialReceiptModel? model = null)
    {
        model ??= new OfficialReceiptModel();

        if (model.Orientation == ReceiptOrientation.Landscape)
        {
            byte[]? landscapeTemplate = null;
            string[] landscapeCandidates = ["or-landscape-template.pdf", "or-landscape.pdf", "or_landscape-template.pdf", "or-landscape", "OfficialReciept.pdf"];
            if (_fillerService != null)
            {
                foreach (var candidate in landscapeCandidates)
                {
                    try
                    {
                        if (_fillerService.TemplateExists(candidate))
                        {
                            landscapeTemplate = _fillerService.GetTemplate(candidate);
                            if (landscapeTemplate != null && landscapeTemplate.Length > 0) break;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Failed to retrieve landscape OR template {Candidate} from filler service.", candidate);
                    }
                }
            }

            landscapeTemplate ??= LoadLocalOrEmbeddedTemplate("or-landscape-template.pdf")
                ?? LoadLocalOrEmbeddedTemplate("OfficialReciept.pdf");

            if (landscapeTemplate != null && landscapeTemplate.Length > 0)
            {
                try
                {
                    var overlays = OfficialReceiptLandscapeOverlayMapper.MapToFieldOverlays(model);
                    return OverlayOnTemplate(landscapeTemplate, overlays, _fillerService);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to overlay landscape Official Receipt template. Falling back to QuestPDF generator.");
                }
            }

            return new OfficialReceiptReport(model).GeneratePdf();
        }

        byte[]? portraitTemplate = null;
        if (_fillerService != null)
        {
            try
            {
                portraitTemplate = _fillerService.GetTemplate("or_portrait-template.pdf");
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to retrieve or_portrait-template.pdf from filler service.");
            }
        }

        if (portraitTemplate == null || portraitTemplate.Length == 0)
        {
            portraitTemplate = LoadLocalOrEmbeddedTemplate("or_portrait-template.pdf");
        }

        if (portraitTemplate != null && portraitTemplate.Length > 0)
        {
            try
            {
                return EDGE.Infrastructure.Printing.Services.AcroForm.OfficialReceiptAcroFormFiller.Fill(portraitTemplate, model);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to fill portrait Official Receipt AcroForm template. Falling back to QuestPDF generator.");
            }
        }

        return new OfficialReceiptReport(model).GeneratePdf();
    }

    public byte[] PrintOrderOfPayment(OrderOfPaymentModel? model = null)
    {
        model ??= new OrderOfPaymentModel();

        byte[]? templateBytes = null;
        if (_fillerService != null)
        {
            try
            {
                templateBytes = _fillerService.GetTemplate("order-of-payment-template.pdf");
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to retrieve order-of-payment-template.pdf from filler service.");
            }
        }

        if (templateBytes == null || templateBytes.Length == 0)
        {
            templateBytes = LoadLocalOrEmbeddedTemplate("order-of-payment-template.pdf");
        }

        if (templateBytes != null && templateBytes.Length > 0)
        {
            try
            {
                return EDGE.Infrastructure.Printing.Services.AcroForm.OrderOfPaymentAcroFormFiller.Fill(templateBytes, model);
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to fill Order of Payment AcroForm template order-of-payment-template.pdf. Falling back to QuestPDF generator.");
            }
        }

        return new OrderOfPaymentReport(model).GeneratePdf();
    }

    public byte[] PrintStatementOfAccount(StatementOfAccountModel? model = null)
    {
        model ??= new StatementOfAccountModel();

        byte[]? templateBytes = null;
        if (_fillerService != null)
        {
            try
            {
                templateBytes = _fillerService.GetTemplate("soa-report-template.pdf");
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to retrieve soa-report-template.pdf from filler service.");
            }
        }

        if (templateBytes == null || templateBytes.Length == 0)
        {
            var asm = typeof(FormPrintingService).Assembly;
            using var stream = asm.GetManifestResourceStream("EDGE.Infrastructure.Printing.Templates.soa-report-template.pdf");
            if (stream != null)
            {
                using var ms = new System.IO.MemoryStream();
                stream.CopyTo(ms);
                templateBytes = ms.ToArray();
            }
        }

        if (templateBytes != null && templateBytes.Length > 0)
        {
            try
            {
                return EDGE.Infrastructure.Printing.Services.AcroForm.StatementOfAccountAcroFormFiller.Fill(templateBytes, model);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to fill soa-report-template.pdf AcroForm.");
            }
        }

        return new StatementOfAccountReport(model).GeneratePdf();
    }

    public byte[] PrintIssuedDocument(IssuedDocumentModel? model = null)
    {
        model ??= new IssuedDocumentModel();

        if (!string.IsNullOrWhiteSpace(model.TemplateName))
        {
            byte[]? templateBytes = null;
            if (_fillerService != null)
            {
                try
                {
                    templateBytes = _fillerService.GetTemplate(model.TemplateName);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to retrieve template {TemplateName} from filler service.", model.TemplateName);
                }
            }

            if (templateBytes == null || templateBytes.Length == 0)
            {
                templateBytes = LoadLocalOrEmbeddedTemplate(model.TemplateName);
            }

            if (templateBytes != null && templateBytes.Length > 0)
            {
                try
                {
                    return EDGE.Infrastructure.Printing.Services.AcroForm.IssuedDocumentAcroFormFiller.Fill(templateBytes, model);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to fill issued document AcroForm template {TemplateName}. Falling back to QuestPDF generator.", model.TemplateName);
                }
            }
        }

        return new IssuedDocumentReport(model).GeneratePdf();
    }

    public byte[] PrintIssuedDocuments(IReadOnlyList<IssuedDocumentModel> models)
    {
        var validModels = (models ?? Array.Empty<IssuedDocumentModel>())
            .Where(m => m != null)
            .ToList();

        if (validModels.Count == 0)
        {
            return PrintIssuedDocument(null);
        }
        if (validModels.Count == 1)
        {
            return PrintIssuedDocument(validModels[0]);
        }

        try
        {
            using var outStream = new MemoryStream();
            using (var writer = new iText.Kernel.Pdf.PdfWriter(outStream))
            using (var mergedPdf = new iText.Kernel.Pdf.PdfDocument(writer))
            {
                foreach (var model in validModels)
                {
                    var pageBytes = PrintIssuedDocument(model);
                    using var pageStream = new MemoryStream(pageBytes);
                    using var reader = new iText.Kernel.Pdf.PdfReader(pageStream);
                    using var srcPdf = new iText.Kernel.Pdf.PdfDocument(reader);
                    srcPdf.CopyPagesTo(1, srcPdf.GetNumberOfPages(), mergedPdf);
                }
            }
            return outStream.ToArray();
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Failed to merge bulk issued document PDFs. Falling back to primary issued document.");
            return PrintIssuedDocument(validModels[0]);
        }
    }

    private static byte[]? LoadLocalOrEmbeddedTemplate(string templateFileName)
    {
        var searchRoots = new[]
        {
            Directory.GetCurrentDirectory(),
            AppDomain.CurrentDomain.BaseDirectory
        };

        foreach (var root in searchRoots)
        {
            var dir = new DirectoryInfo(root);
            while (dir != null)
            {
                var directTemplates = Path.Combine(dir.FullName, "templates", templateFileName);
                if (File.Exists(directTemplates))
                {
                    return File.ReadAllBytes(directTemplates);
                }

                var infrastructureTemplates = Path.Combine(dir.FullName, "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", templateFileName);
                if (File.Exists(infrastructureTemplates))
                {
                    return File.ReadAllBytes(infrastructureTemplates);
                }

                dir = dir.Parent;
            }
        }

        var asm = typeof(FormPrintingService).Assembly;
        var resName = $"EDGE.Infrastructure.Printing.Templates.{templateFileName}";
        using var stream = asm.GetManifestResourceStream(resName);
        if (stream != null)
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            return ms.ToArray();
        }

        // Case-insensitive fallback lookup in embedded manifest resources
        var matchedName = asm.GetManifestResourceNames()
            .FirstOrDefault(r => r.EndsWith($".{templateFileName}", StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(matchedName))
        {
            using var ciStream = asm.GetManifestResourceStream(matchedName);
            if (ciStream != null)
            {
                using var ms = new MemoryStream();
                ciStream.CopyTo(ms);
                return ms.ToArray();
            }
        }

        return null;
    }

    private static byte[] OverlayOnTemplate(byte[] templateBytes, IReadOnlyList<FieldOverlay> overlays, IPdfFormFillerService? fillerService)
    {
        if (fillerService != null)
        {
            return fillerService.OverlayFields(templateBytes, overlays);
        }

        var renderer = new EDGE.Infrastructure.Printing.Services.Rendering.OverlayPdfRenderer();
        using var inStream = new MemoryStream(templateBytes);
        var outStream = renderer.RenderAsync(inStream, overlays).GetAwaiter().GetResult();
        using var ms = new MemoryStream();
        outStream.CopyTo(ms);
        return ms.ToArray();
    }

    public byte[] PrintStatutoryReport(StatutoryReportModel model)
    {
        return new StatutoryReportDocument(model).GeneratePdf();
    }
}


