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
}

public class FormPrintingService : IFormPrintingService
{
    private readonly IPdfFormFillerService? _fillerService;

    public FormPrintingService(IPdfFormFillerService? fillerService = null)
    {
        _fillerService = fillerService;

        // QuestPDF Community license
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    public byte[] PrintConstructionPermit(ConstructionPermitApplication application)
    {
        const string templateName = "ntc-1-11.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc111FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        return new ConstructionPermitReport(application).GeneratePdf();
    }

    public byte[] PrintPurchasePossessSellTransfer(PurchasePossessSellTransferApplication application)
    {
        const string templateName = "ntc-1-09.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc109FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        return new PurchasePossessSellTransferReport(application).GeneratePdf();
    }

    public byte[] PrintCertificateOfRegistration(CertificateOfRegistrationApplication application)
    {
        const string templateName = "ntc-1-19.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc119FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        return new CertificateOfRegistrationReport(application).GeneratePdf();
    }

    public byte[] PrintNtc101(Ntc101Application application)
    {
        const string templateName = "ntc-1-01.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc101FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Fallback: Use dedicated NTC 1-01 report
        return new Ntc101Report(application).GeneratePdf();
    }

    public byte[] PrintNtc102(Ntc102Application application)
    {
        const string templateName = "ntc-1-02.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc102FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Fallback: Use NTC 1-01 report structure or basic generator
        return new Ntc101Report(new Ntc101Application
        {
            ApplicationId = application.ApplicationId,
            Declaration = application.Declaration,
            Payment = application.Payment
        }).GeneratePdf();
    }

    public byte[] PrintNtc103(Ntc103Application application)
    {
        const string templateName = "ntc-1-03.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc103FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Fallback: Use NTC 1-01 report structure or basic generator
        return new Ntc101Report(new Ntc101Application
        {
            ApplicationId = application.ApplicationId,
            Declaration = application.Declaration,
            Payment = application.Payment
        }).GeneratePdf();
    }

    public byte[] PrintNtc104(Ntc104Application application)
    {
        const string templateName = "ntc-1-04.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc104FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Fallback: Use NTC 1-01 report structure or basic generator
        return new Ntc101Report(new Ntc101Application
        {
            ApplicationId = application.ApplicationId,
            Declaration = application.Declaration,
            Payment = application.Payment
        }).GeneratePdf();
    }

    public byte[] PrintNtc105(Ntc105Application application)
    {
        const string templateName = "ntc-1-05.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc105FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Fallback: Use NTC 1-01 report structure or basic generator
        return new Ntc101Report(new Ntc101Application
        {
            ApplicationId = application.ApplicationId,
            Declaration = application.Declaration
        }).GeneratePdf();
    }

    public byte[] PrintNtc110(Ntc110Application application)
    {
        const string templateName = "ntc-1-10.pdf";

        // Use flat PDF overlay when entries fit within the template's 4-column layout (<= 4 entries).
        // For larger entry lists (> 4 entries), switch to dynamic multi-page QuestPDF document generation.
        if (application.Entries.Count <= 4 && _fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlayItems = Ntc110FlatPdfOverlayMapper.MapToOverlayItems(application);
                return _fillerService.OverlayText(template, overlayItems);
            }
        }

        // Code-driven QuestPDF generator for flexible multi-page output
        return new Ntc110Report(application).GeneratePdf();
    }
}
