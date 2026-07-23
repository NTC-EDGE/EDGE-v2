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
                return template;
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
}
