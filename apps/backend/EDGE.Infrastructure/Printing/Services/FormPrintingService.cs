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
    byte[] PrintOfficialReceipt(OfficialReceiptModel? model = null);
    byte[] PrintOrderOfPayment(OrderOfPaymentModel? model = null);
    byte[] PrintStatementOfAccount(StatementOfAccountModel? model = null);
    byte[] PrintIssuedDocument(IssuedDocumentModel? model = null);
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
        const string templateName = "ntc-1-11.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc111FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc109FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc119FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc101FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc102FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc103FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc104FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc105FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
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
                var overlays = Ntc110FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        // Code-driven QuestPDF generator for flexible multi-page output
        return new Ntc110Report(application).GeneratePdf();
    }

    public byte[] PrintNtc114(Ntc114Application application)
    {
        const string templateName = "ntc-1-14.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc114FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        return new Ntc114Report(application).GeneratePdf();
    }

    public byte[] PrintNtc118(Ntc118Application application)
    {
        const string templateName = "ntc-1-18.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc118FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        return new Ntc118Report(application).GeneratePdf();
    }

    public byte[] PrintNtc120(Ntc120Application application)
    {
        const string templateName = "ntc-1-20.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        return new Ntc120Report(application).GeneratePdf();
    }

    public byte[] PrintNtc121(Ntc121Application application)
    {
        const string templateName = "ntc-1-21.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc121FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        throw new InvalidOperationException("Template ntc-1-21.pdf not found.");
    }

    public byte[] PrintNtc122(Ntc122Application application)
    {
        const string templateName = "ntc-1-22.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc122FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        throw new InvalidOperationException("Template ntc-1-22.pdf not found.");
    }

    public byte[] PrintNtc124(Ntc124Application application)
    {
        const string templateName = "ntc-1-24.pdf";
        if (_fillerService != null && _fillerService.TemplateExists(templateName))
        {
            var template = _fillerService.GetTemplate(templateName);
            if (template != null)
            {
                var overlays = Ntc124FlatPdfOverlayMapper.MapToFieldOverlays(application);
                return _fillerService.OverlayFields(template, overlays);
            }
        }

        throw new InvalidOperationException("Template ntc-1-24.pdf not found.");
    }

    public byte[] PrintOfficialReceipt(OfficialReceiptModel? model = null)
    {
        model ??= new OfficialReceiptModel();

        if (_fillerService != null)
        {
            var templateBytes = _fillerService.GetTemplate("or_portrait-template.pdf");
            if (templateBytes != null && templateBytes.Length > 0)
            {
                return EDGE.Infrastructure.Printing.Services.AcroForm.OfficialReceiptAcroFormFiller.Fill(templateBytes, model);
            }
        }

        return new OfficialReceiptReport(model).GeneratePdf();
    }

    public byte[] PrintOrderOfPayment(OrderOfPaymentModel? model = null)
    {
        model ??= new OrderOfPaymentModel();

        if (_fillerService != null)
        {
            try
            {
                var templateBytes = _fillerService.GetTemplate("order-of-payment-template.pdf");
                if (templateBytes != null && templateBytes.Length > 0)
                {
                    return EDGE.Infrastructure.Printing.Services.AcroForm.OrderOfPaymentAcroFormFiller.Fill(templateBytes, model);
                }
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
        return new IssuedDocumentReport(model).GeneratePdf();
    }
}


