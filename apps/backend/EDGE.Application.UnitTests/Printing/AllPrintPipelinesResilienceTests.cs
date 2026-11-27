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

    [Fact]
    public void FormPrintingService_All16ApplicationForms_FallBackToQuestPdf_WhenTemplateFillerThrows()
    {
        var service = CreateServiceWithFailingFiller();

        AssertValidPdf(service.PrintConstructionPermit(MockDataFactory.GetConstructionPermitApplication()));
        AssertValidPdf(service.PrintPurchasePossessSellTransfer(MockDataFactory.GetPurchasePossessSellTransferApplication()));
        AssertValidPdf(service.PrintCertificateOfRegistration(MockDataFactory.GetCertificateOfRegistrationApplication()));
        AssertValidPdf(service.PrintNtc101(MockDataFactory.GetNtc101Application()));
        AssertValidPdf(service.PrintNtc102(MockDataFactory.GetNtc102Application()));
        AssertValidPdf(service.PrintNtc103(MockDataFactory.GetNtc103Application()));
        AssertValidPdf(service.PrintNtc104(MockDataFactory.GetNtc104Application()));
        AssertValidPdf(service.PrintNtc105(MockDataFactory.GetNtc105Application()));
        AssertValidPdf(service.PrintNtc110(MockDataFactory.GetNtc110Application()));
        AssertValidPdf(service.PrintNtc114(MockDataFactory.GetNtc114Application()));
        AssertValidPdf(service.PrintNtc118(MockDataFactory.GetNtc118Application()));
        AssertValidPdf(service.PrintNtc120(MockDataFactory.GetNtc120Application()));
        AssertValidPdf(service.PrintNtc121(new Ntc121Application { ApplicationId = Guid.NewGuid() }));
        AssertValidPdf(service.PrintNtc122(new Ntc122Application { ApplicationId = Guid.NewGuid() }));
        AssertValidPdf(service.PrintNtc124(new Ntc124Application { ApplicationId = Guid.NewGuid(), AffiantName = "TEST AFFIANT" }));
        AssertValidPdf(service.PrintNtc125(new Ntc125Application { ApplicationId = Guid.NewGuid(), StateBrieflyDetails = "Test complaint" }));
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
}
