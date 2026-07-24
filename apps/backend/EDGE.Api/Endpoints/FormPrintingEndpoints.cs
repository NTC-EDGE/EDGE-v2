using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace EDGE.Api.Endpoints;

/// <summary>
/// TEMPORARY demo endpoints — exercises FormPrintingService end-to-end using
/// MockDataFactory instead of a real application lookup, so the printing
/// feature can be tested/demoed before Service.Contract -> FormSubmission ->
/// DTO data path is wired up.
/// </summary>
public static class FormPrintingEndpoints
{
    public static IEndpointRouteBuilder MapFormPrintingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/forms/demo").WithTags("FormPrintingDemo");

        /// <summary>GET /api/forms/demo/ntc-1-11 — Construction Permit / Radio Station License.</summary>
        group.MapGet("/ntc-1-11", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetConstructionPermitApplication();
            var pdfBytes = printingService.PrintConstructionPermit(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-11_{application.ApplicationId}.pdf");
        })
        .WithName("PrintConstructionPermitDemo");

        /// <summary>GET /api/forms/demo/ntc-1-09 — Permit to Purchase/Possess/Sell/Transfer.</summary>
        group.MapGet("/ntc-1-09", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetPurchasePossessSellTransferApplication();
            var pdfBytes = printingService.PrintPurchasePossessSellTransfer(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-09_{application.ApplicationId}.pdf");
        })
        .WithName("PrintPurchasePossessSellTransferDemo");

        /// <summary>GET /api/forms/demo/ntc-1-19 — Certificate of Registration.</summary>
        group.MapGet("/ntc-1-19", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetCertificateOfRegistrationApplication();
            var pdfBytes = printingService.PrintCertificateOfRegistration(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-19_{application.ApplicationId}.pdf");
        })
        .WithName("PrintCertificateOfRegistrationDemo");

        /// <summary>GET /api/forms/demo/ntc-1-01 — Application Form 1-01 (Radio Operator Examination).</summary>
        group.MapGet("/ntc-1-01", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc101Application();
            var pdfBytes = printingService.PrintNtc101(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-01_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc101Demo");

        /// <summary>GET /api/forms/demo/ntc-1-02 — Application Form 1-02 (Radio Operator Certificate).</summary>
        group.MapGet("/ntc-1-02", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc102Application();
            var pdfBytes = printingService.PrintNtc102(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-02_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc102Demo");

        /// <summary>GET /api/forms/demo/ntc-1-03 — Application Form 1-03 (Amateur Radio Certificate / License).</summary>
        group.MapGet("/ntc-1-03", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc103Application();
            var pdfBytes = printingService.PrintNtc103(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-03_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc103Demo");

        /// <summary>GET /api/forms/demo/ntc-1-04 — Application Form 1-04 (Maritime / Ship Radio Station License).</summary>
        group.MapGet("/ntc-1-04", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc104Application();
            var pdfBytes = printingService.PrintNtc104(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-04_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc104Demo");

        /// <summary>GET /api/forms/demo/ntc-1-05 — Application Form 1-05 (Form A - Multiple Stations/Equipment).</summary>
        group.MapGet("/ntc-1-05", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc105Application();
            var pdfBytes = printingService.PrintNtc105(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-05_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc105Demo");

        /// <summary>GET /api/forms/demo/ntc-1-10 — Application Form 1-10 (Form E - Multiple Stations/Equipment).</summary>
        group.MapGet("/ntc-1-10", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc110Application();
            var pdfBytes = printingService.PrintNtc110(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-10_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc110Demo");

        /// <summary>GET /api/forms/demo/ntc-1-14 — Application Form 1-14 (Temporary Permit to Propagate/Demonstrate).</summary>
        group.MapGet("/ntc-1-14", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc114Application();
            var pdfBytes = printingService.PrintNtc114(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-14_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc114Demo");

        /// <summary>GET /api/forms/demo/ntc-1-18 — Application Form 1-18 (Dealer/Manufacturer/Service Center/Retailer/Reseller Permit/CPE Supplier Accreditation).</summary>
        group.MapGet("/ntc-1-18", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc118Application();
            var pdfBytes = printingService.PrintNtc118(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-18_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc118Demo");

        /// <summary>GET /api/forms/demo/ntc-1-20 — Application Form 1-20 (Certificate of Registration - VAS / VOIP / PCSOTSP).</summary>
        group.MapGet("/ntc-1-20", (IFormPrintingService printingService) =>
        {
            var application = MockDataFactory.GetNtc120Application();
            var pdfBytes = printingService.PrintNtc120(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-20_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc120Demo");

        /// <summary>GET /api/forms/demo/official-receipt/blank — Blank Official Receipt Template (Portrait).</summary>
        group.MapGet("/official-receipt/blank", (IFormPrintingService printingService) =>
        {
            var pdfBytes = printingService.PrintOfficialReceipt();
            return Results.File(pdfBytes, "application/pdf", "OfficialReceipt_Portrait_BlankTemplate.pdf");
        })
        .WithName("PrintOfficialReceiptBlankDemo");

        /// <summary>GET /api/forms/demo/official-receipt/sample — Populated Sample Official Receipt (Portrait #1521324).</summary>
        group.MapGet("/official-receipt/sample", (IFormPrintingService printingService) =>
        {
            var model = MockDataFactory.GetOfficialReceiptModel();
            var pdfBytes = printingService.PrintOfficialReceipt(model);
            return Results.File(pdfBytes, "application/pdf", $"OfficialReceipt_Portrait_{model.ReceiptNo}.pdf");
        })
        .WithName("PrintOfficialReceiptSampleDemo");

        /// <summary>GET /api/forms/demo/official-receipt/landscape/blank — Blank Official Receipt Template (Landscape).</summary>
        group.MapGet("/official-receipt/landscape/blank", (IFormPrintingService printingService) =>
        {
            var model = new OfficialReceiptModel { Orientation = ReceiptOrientation.Landscape };
            var pdfBytes = printingService.PrintOfficialReceipt(model);
            return Results.File(pdfBytes, "application/pdf", "OfficialReceipt_Landscape_BlankTemplate.pdf");
        })
        .WithName("PrintOfficialReceiptLandscapeBlankDemo");

        /// <summary>GET /api/forms/demo/official-receipt/landscape/sample — Populated Sample Official Receipt (Landscape #1497771).</summary>
        group.MapGet("/official-receipt/landscape/sample", (IFormPrintingService printingService) =>
        {
            var model = MockDataFactory.GetOfficialReceiptLandscapeModel();
            var pdfBytes = printingService.PrintOfficialReceipt(model);
            return Results.File(pdfBytes, "application/pdf", $"OfficialReceipt_Landscape_{model.ReceiptNo}.pdf");
        })
        .WithName("PrintOfficialReceiptLandscapeSampleDemo");

        /// <summary>GET /api/forms/demo/order-of-payment/blank — Blank Order of Payment Template.</summary>
        group.MapGet("/order-of-payment/blank", (IFormPrintingService printingService) =>
        {
            var pdfBytes = printingService.PrintOrderOfPayment();
            return Results.File(pdfBytes, "application/pdf", "OrderOfPayment_BlankTemplate.pdf");
        })
        .WithName("PrintOrderOfPaymentBlankDemo");

        /// <summary>GET /api/forms/demo/order-of-payment/sample — Populated Sample Order of Payment (Florito Avenido Amistad).</summary>
        group.MapGet("/order-of-payment/sample", (IFormPrintingService printingService) =>
        {
            var model = MockDataFactory.GetOrderOfPaymentModel();
            var pdfBytes = printingService.PrintOrderOfPayment(model);
            return Results.File(pdfBytes, "application/pdf", "OrderOfPayment_Sample_FloritoAmistad.pdf");
        })
        .WithName("PrintOrderOfPaymentSampleDemo");

        /// <summary>GET /api/forms/demo/statement-of-account/blank — Blank Statement of Account Template.</summary>
        group.MapGet("/statement-of-account/blank", (IFormPrintingService printingService) =>
        {
            var pdfBytes = printingService.PrintStatementOfAccount();
            return Results.File(pdfBytes, "application/pdf", "StatementOfAccount_BlankTemplate.pdf");
        })
        .WithName("PrintStatementOfAccountBlankDemo");

        /// <summary>GET /api/forms/demo/statement-of-account/sample — Populated Sample Statement of Account (Dezza Collection / TEMP-ROXIV-14148-26).</summary>
        group.MapGet("/statement-of-account/sample", (IFormPrintingService printingService) =>
        {
            var model = MockDataFactory.GetStatementOfAccountModel();
            var pdfBytes = printingService.PrintStatementOfAccount(model);
            return Results.File(pdfBytes, "application/pdf", $"StatementOfAccount_Sample_{model.AccountNo}.pdf");
        })
        .WithName("PrintStatementOfAccountSampleDemo");

        return app;
    }
}



