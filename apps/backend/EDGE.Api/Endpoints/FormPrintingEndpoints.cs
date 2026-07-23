using EDGE.Infrastructure.Printing.MockData;
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
            // TODO: replace with a real lookup, e.g.
            // var application = await applicationRepository.GetConstructionPermitAsync(applicationId);
            var application = MockDataFactory.GetConstructionPermitApplication();

            var pdfBytes = printingService.PrintConstructionPermit(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-11_{application.ApplicationId}.pdf");
        })
        .WithName("PrintConstructionPermitDemo");

        /// <summary>GET /api/forms/demo/ntc-1-09 — Permit to Purchase/Possess/Sell/Transfer.</summary>
        group.MapGet("/ntc-1-09", (IFormPrintingService printingService) =>
        {
            // TODO: replace with a real lookup, e.g.
            // var application = await applicationRepository.GetPurchasePossessSellTransferAsync(applicationId);
            var application = MockDataFactory.GetPurchasePossessSellTransferApplication();

            var pdfBytes = printingService.PrintPurchasePossessSellTransfer(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-09_{application.ApplicationId}.pdf");
        })
        .WithName("PrintPurchasePossessSellTransferDemo");

        /// <summary>GET /api/forms/demo/ntc-1-19 — Certificate of Registration.</summary>
        group.MapGet("/ntc-1-19", (IFormPrintingService printingService) =>
        {
            // TODO: replace with a real lookup, e.g.
            // var application = await applicationRepository.GetCertificateOfRegistrationAsync(applicationId);
            var application = MockDataFactory.GetCertificateOfRegistrationApplication();

            var pdfBytes = printingService.PrintCertificateOfRegistration(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-19_{application.ApplicationId}.pdf");
        })
        .WithName("PrintCertificateOfRegistrationDemo");

        return app;
    }
}
