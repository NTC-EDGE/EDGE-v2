using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.AcroForm;
using EDGE.Infrastructure.Printing.Services.Templates;
using iText.Forms;
using iText.Kernel.Pdf;
using Xunit;
using Xunit.Abstractions;

namespace EDGE.Application.UnitTests.Printing;

public class IssuedDocumentServicesPrintingTests
{
    private readonly ITestOutputHelper _output;

    public IssuedDocumentServicesPrintingTests(ITestOutputHelper output)
    {
        _output = output;
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    [Fact]
    public async Task ExamAdmissionSlip_FillsAndProducesValidPdf()
    {
        // 1. Arrange Provider & Model
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            null);

        var templateResource = await provider.GetTemplateResourceAsync("Service-1-Admission-Slip.pdf");
        Assert.NotNull(templateResource);

        using var ms = new MemoryStream();
        await templateResource.Stream.CopyToAsync(ms);
        var templateBytes = ms.ToArray();

        var model = new IssuedDocumentModel
        {
            TemplateName = "Service-1-Admission-Slip.pdf",
            DocumentType = "Admission Slip",
            DocumentTitle = "EXAMINATION ADMISSION SLIP",
            LicenseeName = "JUAN DELA CRUZ",
            Address = "123 Mabini St., Quezon City",
            RegionalOffice = "National Capital Region",
            Exam = "COMMERCIAL RADIO OPERATOR EXAMINATION",
            ExamVenue = "NTC Central Office Hall A",
            ExamDate = "11/15/2026",
            ExamTime = "08:30 AM",
            ExamElements = "Elements 1, 2, 3, 4",
            Others = "First Time Examinee",
            AmountPaid = 250.00m,
            OfficialReceiptNumber = "OR-1002345",
            OrDate = "10/16/2026",
            SignatoryName = "DIR. ENGR. JUANITA SANTOS",
            EvaluatorName = "Engr. Pedro Reyes",
            QrVerificationCode = "NTC-VERIFY-EXAM-1002345"
        };

        // 2. Act: Fill template
        var filledBytes = IssuedDocumentAcroFormFiller.Fill(templateBytes, model);

        // 3. Assert
        Assert.NotNull(filledBytes);
        Assert.True(filledBytes.Length > 5000, "Filled Admission Slip PDF should be substantial in size");

        // Verify it is a valid PDF
        using var checkReader = new PdfReader(new MemoryStream(filledBytes));
        using var checkDoc = new PdfDocument(checkReader);
        Assert.Equal(1, checkDoc.GetNumberOfPages());

        _output.WriteLine($"Exam Admission Slip generated successfully: {filledBytes.Length} bytes.");
    }

    [Fact]
    public async Task ExamAdmissionSlip_WithApplicantPhotoAndQr_FillsSuccessfully()
    {
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            null);

        var templateResource = await provider.GetTemplateResourceAsync("Service-1-Admission-Slip.pdf");
        Assert.NotNull(templateResource);

        using var ms = new MemoryStream();
        await templateResource.Stream.CopyToAsync(ms);
        var templateBytes = ms.ToArray();

        // 1x1 test image bytes
        byte[] tinyPngBytes = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");

        var model = new IssuedDocumentModel
        {
            TemplateName = "Service-1-Admission-Slip.pdf",
            DocumentType = "Admission Slip",
            DocumentTitle = "EXAMINATION ADMISSION SLIP",
            LicenseeName = "MARIA CLARA DE LOS SANTOS",
            Address = "Unit 401 Sunset Blvd, Cebu City",
            RegionalOffice = "Region VII",
            Exam = "RESTRICTED RADIOTELEPHONE OPERATOR CERTIFICATE (RROC)",
            ExamVenue = "NTC Regional Office VII Mandaue",
            ExamDate = "12/01/2026",
            ExamTime = "09:00 AM",
            AmountPaid = 250.00m,
            OfficialReceiptNumber = "OR-998877",
            SignatoryName = "DIR. ENGR. JUANITA SANTOS",
            QrVerificationCode = "NTC-VERIFY-EXAM-998877",
            ApplicantPhotoBytes = tinyPngBytes,
            ApplicantPhotoUrl = "https://cdn.edge.ntc.gov.ph/photos/maria.png"
        };

        var filledBytes = IssuedDocumentAcroFormFiller.Fill(templateBytes, model);

        Assert.NotNull(filledBytes);
        Assert.True(filledBytes.Length > 5000);

        using var checkReader = new PdfReader(new MemoryStream(filledBytes));
        using var checkDoc = new PdfDocument(checkReader);
        Assert.Equal(1, checkDoc.GetNumberOfPages());
    }

    [Fact]
    public async Task Accreditation_SupplierAndDealerPermits_FillsAndProducesValidPdf()
    {
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            null);

        var templates = new[]
        {
            "Service-15-Supplier-Accreditation.pdf",
            "Service-15-CPE-Dealers-Permit.pdf"
        };

        foreach (var templateName in templates)
        {
            var templateResource = await provider.GetTemplateResourceAsync(templateName);
            Assert.NotNull(templateResource);

            using var ms = new MemoryStream();
            await templateResource.Stream.CopyToAsync(ms);
            var templateBytes = ms.ToArray();

            var model = new IssuedDocumentModel
            {
                TemplateName = templateName,
                DocumentType = "Accreditation",
                DocumentTitle = "CERTIFICATE OF ACCREDITATION",
                LicenseeName = "ACME TELECOM CORP.",
                CompanyName = "ACME TELECOM CORP.",
                Address = "Unit 502 Cyber Tower, Ortigas Center, Pasig City",
                ContactNumber = "0917-123-4567",
                FaxNumber = "02-8888-9999",
                RegistrationNumber = "NTC-ACCR-2026-0042",
                PermitNumber = "NTC-ACCR-2026-0042",
                IssueDate = new DateTime(2026, 10, 16),
                ExpiryDate = new DateTime(2029, 10, 16),
                ValidityPeriod = "THREE (3) YEARS",
                RegionalOffice = "National Capital Region",
                SignatoryName = "DIR. ENGR. JUANITA SANTOS",
                AmountPaid = 3600.00m,
                OfficialReceiptNumber = "OR-883921",
                OrDate = "10/16/2026",
                OrBy = "SCO Maria Santos",
                QrVerificationCode = "NTC-VERIFY-ACCR-0042",
                Notes = "Subject to annual regulatory compliance inspection."
            };

            var filledBytes = IssuedDocumentAcroFormFiller.Fill(templateBytes, model);

            Assert.NotNull(filledBytes);
            Assert.True(filledBytes.Length > 5000);

            using var checkReader = new PdfReader(new MemoryStream(filledBytes));
            using var checkDoc = new PdfDocument(checkReader);
            Assert.Equal(1, checkDoc.GetNumberOfPages());

            _output.WriteLine($"Accreditation '{templateName}' generated successfully: {filledBytes.Length} bytes.");
        }
    }

    [Fact]
    public async Task Certificates_ROC_Amateur_WDN_Exemption_FillsAndProducesValidPdf()
    {
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            null);

        var templates = new[]
        {
            "Service-2-ROC.pdf",
            "Service-3-Amateur-License.pdf",
            "Service-16-Certificate-of-Registration-WDN.pdf",
            "Service-20-Certificate-Of-Exemption.pdf"
        };

        foreach (var templateName in templates)
        {
            var templateResource = await provider.GetTemplateResourceAsync(templateName);
            Assert.NotNull(templateResource);

            using var ms = new MemoryStream();
            await templateResource.Stream.CopyToAsync(ms);
            var templateBytes = ms.ToArray();

            var model = new IssuedDocumentModel
            {
                TemplateName = templateName,
                DocumentType = "Certificate",
                DocumentTitle = "CERTIFICATE OF REGISTRATION",
                LicenseeName = "MARIA CLARA DE LOS SANTOS",
                Address = "Barangay San Antonio, Pasig City",
                StationLocation = "Barangay San Antonio, Pasig City",
                RegistrationNumber = "NTC-WDN-2026-9901",
                PermitNumber = "NTC-WDN-2026-9901",
                CallSign = "4D1MC",
                StationClass = "Class A Amateur",
                Category = "Commercial",
                Citizenship = "Filipino",
                BirthDate = "05/12/1988",
                Sex = "Female",
                Height = "165 cm",
                Weight = "55 kg",
                Exam = "Radio Operator Examination",
                ExamDate = "09/20/2026",
                ExamVenue = "NTC NCR Exam Room",
                ExamRating = "88.5%",
                MakeTypeModel = "Ubiquiti UniFi AP 6 Pro / Cisco Catalyst",
                Quantity = "2",
                SerialNumber = "UB-990123, UB-990124",
                OtherEquipment = "Omni Antenna 5dBi, 5.8 GHz Band",
                AuthorizedEquipment = "Transceiver 100W",
                FrequencyRange = "5150 - 5850 MHz",
                PowerOutput = "200 mW",
                IssueDate = new DateTime(2026, 10, 16),
                ExpiryDate = new DateTime(2029, 10, 16),
                ValidityPeriod = "THREE (3) YEARS",
                RegionalOffice = "National Capital Region",
                SignatoryName = "DIR. ENGR. JUANITA SANTOS",
                EvaluatorName = "Engr. Pedro Reyes",
                AmountPaid = 1200.00m,
                OfficialReceiptNumber = "OR-772819",
                OrDate = "10/16/2026",
                OrBy = "SCO Maria Santos",
                QrVerificationCode = "NTC-VERIFY-CERT-9901",
                Notes = "Valid for registered locations only."
            };

            var filledBytes = IssuedDocumentAcroFormFiller.Fill(templateBytes, model);

            Assert.NotNull(filledBytes);
            Assert.True(filledBytes.Length > 5000);

            using var checkReader = new PdfReader(new MemoryStream(filledBytes));
            using var checkDoc = new PdfDocument(checkReader);
            Assert.Equal(1, checkDoc.GetNumberOfPages());

            _output.WriteLine($"Certificate '{templateName}' generated successfully: {filledBytes.Length} bytes.");
        }
    }

    [Fact]
    public void FormPrintingService_PrintIssuedDocument_ResolvesTemplateAndPrints()
    {
        var printingService = new FormPrintingService();

        // 1. Test Exam category
        var examModel = new IssuedDocumentModel
        {
            TemplateName = "Service-1-Admission-Slip.pdf",
            LicenseeName = "JUAN DELA CRUZ",
            Address = "Quezon City",
            Exam = "Commercial Radio Operator Examination",
            RegionalOffice = "NCR"
        };
        var examPdf = printingService.PrintIssuedDocument(examModel);
        Assert.NotNull(examPdf);
        Assert.True(examPdf.Length > 5000);

        // 2. Test Accreditation category
        var accrModel = new IssuedDocumentModel
        {
            TemplateName = "Service-15-Supplier-Accreditation.pdf",
            LicenseeName = "TEST SUPPLIER CORP.",
            Address = "Makati City",
            RegionalOffice = "NCR"
        };
        var accrPdf = printingService.PrintIssuedDocument(accrModel);
        Assert.NotNull(accrPdf);
        Assert.True(accrPdf.Length > 5000);

        // 3. Test Fallback (when template is empty or not found)
        var fallbackModel = new IssuedDocumentModel
        {
            TemplateName = "non-existent-template.pdf",
            LicenseeName = "FALLBACK USER"
        };
        var fallbackPdf = printingService.PrintIssuedDocument(fallbackModel);
        Assert.NotNull(fallbackPdf);
        Assert.True(fallbackPdf.Length > 1000);

        _output.WriteLine("FormPrintingService PrintIssuedDocument verified with template filling and QuestPDF fallback!");
    }

    [Fact]
    public void IssuedDocumentPrintMapper_CorrectlyMapsCategoriesAndDevices()
    {
        // Arrange application with registered devices in JSON repeater format
        var doc = new IssuedDocumentDetail
        {
            Id = Guid.NewGuid(),
            DocumentType = "Certificate",
            FormNumber = "APP-2026-WDN-001",
            LicenseNumber = "NTC-WDN-001",
            IssueDate = new DateTime(2026, 10, 16),
            ExpiryDate = new DateTime(2029, 10, 16),
            IssuedByStaffName = "Engr. Director Santos",
            OriginalEvaluatorName = "Engr. Evaluator Ramos"
        };

        var service = new Service
        {
            Code = "NTC_1_16_WDN",
            Name = "Wireless Data Network (WDN) Registration",
            ServiceCategory = new ServiceCategory { Name = "Certificates" }
        };

        var applicant = new EDGE.Domain.Entities.Applicant
        {
            Service = service,
            ApplicantDetail = new ApplicantDetail
            {
                FirstName = "Juan",
                LastName = "Dela Cruz",
                Address = "123 Rizal St., Manila",
                Nationality = "Filipino",
                BirthDate = new DateOnly(1990, 1, 1),
                Sex = "Male"
            }
        };

        var app = new EDGE.Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-2026-WDN-001",
            ReferenceNumber = "REF-2026-001",
            Office = "National Capital Region",
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { Applicant = applicant }
            },
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment
                {
                    Status = OpStatus.Paid,
                    OfficialReceiptNumber = "OR-123456",
                    PaidAt = new DateTime(2026, 10, 16),
                    AmountDue = 1500.00m
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new FormSubmission
                {
                    FieldValues = new List<FormFieldValue>
                    {
                        new FormFieldValue
                        {
                            CustomLabel = "Registered Devices",
                            Value = "[{\"make\": \"MikroTik\", \"model\": \"RouterBOARD 951Ui\", \"serialNumber\": \"MT-951-001\"}, {\"make\": \"Ubiquiti\", \"model\": \"Rocket M5\", \"serialNumber\": \"UB-M5-002\"}]"
                        }
                    }
                }
            }
        };

        // Act
        var mapped = IssuedDocumentPrintMapper.MapToPrintModel(doc, app);

        // Assert
        Assert.Equal("Service-16-Certificate-of-Registration-WDN.pdf", mapped.TemplateName);
        Assert.Equal("Certificate", mapped.DocumentType);
        Assert.Equal("CERTIFICATE OF REGISTRATION", mapped.DocumentTitle);
        Assert.Equal("Juan Dela Cruz", mapped.LicenseeName);
        Assert.Equal("123 Rizal St., Manila", mapped.Address);
        Assert.Equal("MikroTik / Ubiquiti / RouterBOARD 951Ui / Rocket M5", mapped.MakeTypeModel);
        Assert.Equal("MT-951-001, UB-M5-002", mapped.SerialNumber);
        Assert.Equal("2", mapped.Quantity);
        Assert.Equal("OR-123456", mapped.OfficialReceiptNumber);
        Assert.Equal(1500.00m, mapped.AmountPaid);
        Assert.Equal("National Capital Region", mapped.RegionalOffice);
    }
}
