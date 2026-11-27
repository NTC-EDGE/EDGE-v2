using System;
using System.Collections.Generic;
using System.Text;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Printing.MockData;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;

namespace EDGE.Application.UnitTests.Printing;

public class AllPrintPipelinesResilienceTests
{
    private static FormPrintingService CreateServiceWithFailingFiller()
    {
        var failingFiller = new Mock<IPdfFormFillerService>();
        failingFiller.Setup(x => x.TemplateExists(It.IsAny<string>()))
            .Throws(new InvalidOperationException("Simulated R2 outage"));
        failingFiller.Setup(x => x.GetTemplate(It.IsAny<string>()))
            .Throws(new InvalidOperationException("Simulated corrupt template"));
        failingFiller.Setup(x => x.OverlayFields(
                It.IsAny<byte[]>(),
                It.IsAny<IReadOnlyList<FieldOverlay>>(),
                It.IsAny<OverlayDebugOptions?>()))
            .Throws(new InvalidOperationException("Simulated PDFSharp failure"));

        return new FormPrintingService(failingFiller.Object);
    }

    private static void AssertValidPdf(byte[] pdfBytes)
    {
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(500);
        Encoding.ASCII.GetString(pdfBytes, 0, 4).Should().Be("%PDF");
    }

    private static void AssertOfficialNtcTemplatePdf(byte[] pdfBytes)
    {
        AssertValidPdf(pdfBytes);
        // Official NTC PDF templates must NOT silently be replaced by non-NTC QuestPDF forms
        Encoding.ASCII.GetString(pdfBytes).Should().NotContain("QuestPDF");
    }

    [Fact]
    public void FormPrintingService_AllOfficialApplicationForms_PreserveOfficialNtcTemplate_WhenCloudFillerThrows()
    {
        var service = CreateServiceWithFailingFiller();

        // All 13 active official NTC application forms must render their real official NTC PDF template
        AssertOfficialNtcTemplatePdf(service.PrintNtc101(MockDataFactory.GetNtc101Application()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc102(MockDataFactory.GetNtc102Application()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc103(MockDataFactory.GetNtc103Application()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc104(MockDataFactory.GetNtc104Application()));
        AssertOfficialNtcTemplatePdf(service.PrintPurchasePossessSellTransfer(MockDataFactory.GetPurchasePossessSellTransferApplication()));
        AssertOfficialNtcTemplatePdf(service.PrintConstructionPermit(MockDataFactory.GetConstructionPermitApplication()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc118(MockDataFactory.GetNtc118Application()));
        AssertOfficialNtcTemplatePdf(service.PrintCertificateOfRegistration(MockDataFactory.GetCertificateOfRegistrationApplication()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc120(MockDataFactory.GetNtc120Application()));
        AssertOfficialNtcTemplatePdf(service.PrintNtc121(new Ntc121Application { ApplicationId = Guid.NewGuid() }));
        AssertOfficialNtcTemplatePdf(service.PrintNtc122(new Ntc122Application { ApplicationId = Guid.NewGuid() }));
        AssertOfficialNtcTemplatePdf(service.PrintNtc124(new Ntc124Application { ApplicationId = Guid.NewGuid(), AffiantName = "TEST AFFIANT" }));
        AssertOfficialNtcTemplatePdf(service.PrintNtc125(new Ntc125Application { ApplicationId = Guid.NewGuid(), StateBrieflyDetails = "Test complaint" }));

        // Legacy demo-only forms still produce valid fallback PDFs cleanly without throwing
        AssertValidPdf(service.PrintNtc105(MockDataFactory.GetNtc105Application()));
        AssertValidPdf(service.PrintNtc110(MockDataFactory.GetNtc110Application()));
        AssertValidPdf(service.PrintNtc114(MockDataFactory.GetNtc114Application()));
    }

    [Fact]
    public void FormPrintingService_FinancialAndIssuedDocuments_FallBackCleanly_WhenTemplateFillerThrows()
    {
        var service = CreateServiceWithFailingFiller();

        AssertValidPdf(service.PrintStatementOfAccount(MockDataFactory.GetStatementOfAccountModel()));
        AssertValidPdf(service.PrintOrderOfPayment(MockDataFactory.GetOrderOfPaymentModel()));
        AssertValidPdf(service.PrintOfficialReceipt(MockDataFactory.GetOfficialReceiptModel()));
        AssertValidPdf(service.PrintOfficialReceipt(MockDataFactory.GetOfficialReceiptLandscapeModel()));
        AssertValidPdf(service.PrintIssuedDocument(new IssuedDocumentModel
        {
            DocumentType = "Radio Station License",
            LicenseeName = "ACME TELECOM",
            TemplateName = "Service-8-Radio-Station-License.pdf"
        }));
        AssertValidPdf(service.PrintIssuedDocuments(new[]
        {
            new IssuedDocumentModel { DocumentType = "License", LicenseeName = "APPLICANT A" },
            new IssuedDocumentModel { DocumentType = "License", LicenseeName = "APPLICANT B" }
        }));
    }

    [Fact]
    public void ApplicationFormPrintMapper_WithNumericJsonAndSpecialCharsInAppNumber_GeneratesValidPdfAndSafeFilename()
    {
        var service = CreateServiceWithFailingFiller();
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP/2026:01, TEST",
            ApplicationApplicants = null!,
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    FieldValues = new List<FormFieldValue>
                    {
                        new()
                        {
                            CustomLabel = "action_requested",
                            Value = "Block"
                        },
                        new()
                        {
                            CustomLabel = "device_particulars",
                            Value = "[{\"imei_number\":351234567890123,\"make_model_type\":15}]"
                        },
                        new()
                        {
                            CustomLabel = "sim_mobile_numbers",
                            Value = "[{\"mobile_number\":9171234567}]"
                        }
                    }
                }
            }
        };

        var (pdfBytes, fileName, formCode) = ApplicationFormPrintMapper.PrintApplicationForm(app, service);

        formCode.Should().Be("NTC_1_24");
        AssertValidPdf(pdfBytes);
        fileName.Should().NotContain("/");
        fileName.Should().NotContain(":");
        fileName.Should().NotContain(",");
        fileName.Should().EndWith(".pdf");
    }

    [Fact]
    public void IssuedDocumentPrintMapper_WithNullCollections_DoesNotThrowAndAvoidsHardcodedRegion()
    {
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-2026-009",
            ApplicationApplicants = null!,
            FormSubmissions = null!,
            OrdersOfPayment = null!,
            StatementsOfAccount = null!,
            ApplicationRequirements = null!
        };

        var doc = new IssuedDocumentDetail
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            DocumentType = "Permit to Purchase/Possess"
        };

        var model = IssuedDocumentPrintMapper.MapToPrintModel(doc, app);

        model.Should().NotBeNull();
        model.RegionalOffice.Should().NotBe("National Capital Region");
        var service = CreateServiceWithFailingFiller();
        AssertValidPdf(service.PrintIssuedDocument(model));
    }

    [Fact]
    public void OrderOfPaymentAndSoa_RemoveGreySignaturePlaceholders_AndStampOptionalSignatures()
    {
        // Minimal valid 1x1 transparent PNG
        var samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        var dataUri = $"data:image/png;base64,{samplePngBase64}";

        var decoded = EDGE.Infrastructure.Printing.Services.AcroForm.SignatoryImageHelper.TryDecodeInlineSignatureBytes(dataUri);
        decoded.Should().NotBeNull();
        EDGE.Infrastructure.Printing.Services.AcroForm.SignatoryImageHelper.TryDecodeInlineSignatureBytes("JUAN DELA CRUZ").Should().BeNull();
        EDGE.Infrastructure.Printing.Services.AcroForm.SignatoryImageHelper.TryDecodeInlineSignatureBytes(Guid.NewGuid().ToString()).Should().BeNull();

        var service = new FormPrintingService(new PdfFormFillerService());

        var opModel = MockDataFactory.GetOrderOfPaymentModel();
        opModel.CollectingOfficer = "MARIA C. SANTOS";
        opModel.CollectingOfficerPosition = "Accountant III";
        var opWithoutSig = service.PrintOrderOfPayment(opModel);
        AssertValidPdf(opWithoutSig);

        opModel.CollectingOfficerSignature = dataUri;
        var opWithSig = service.PrintOrderOfPayment(opModel);
        AssertValidPdf(opWithSig);
        opWithSig.Length.Should().BeGreaterThan(opWithoutSig.Length);

        var soaModel = MockDataFactory.GetStatementOfAccountModel();
        var soaWithoutSig = service.PrintStatementOfAccount(soaModel);
        AssertValidPdf(soaWithoutSig);

        soaModel.PreparedBySignature = dataUri;
        soaModel.ApprovedBySignature = dataUri;
        var soaWithSig = service.PrintStatementOfAccount(soaModel);
        AssertValidPdf(soaWithSig);
        soaWithSig.Length.Should().BeGreaterThan(soaWithoutSig.Length);
    }
}
