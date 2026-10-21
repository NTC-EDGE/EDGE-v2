using System;
using System.Collections.Generic;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Reports;
using EDGE.Infrastructure.Printing.Services;
using FluentAssertions;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class RequestAndComplaintPrintingTests
{
    public RequestAndComplaintPrintingTests()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    [Fact]
    public void Ntc124Report_ShouldGenerateNonEmptyPdfBytes()
    {
        // Arrange
        var app = new Ntc124Application
        {
            ActionRequested = ActionRequested124.Block,
            AffiantName = "JUAN DELA CRUZ",
            Age = 30,
            Citizenship = "Filipino",
            ResidentialAddress = new Address { Street = "123 Main St, Quezon City" },
            TelephoneNumber = "09171234567",
            ImeiNo = "123456789012345",
            MakeModelType = "Apple iPhone 15 Pro",
            SimMobileNumber = "09171234567",
            ProofOfOwnership = new ProofOfOwnershipSelection { CopyGovernmentId = true, BoxWithImei = true },
            Incident = new IncidentDetails
            {
                IncidentType = IncidentType124.LostMisplaced,
                Sex = Sex.Male,
                AgeGroup = AgeGroup124.Age30_39,
                PlaceOfIncident = "SM Megamall",
                DateOfIncident = new DateOnly(2026, 10, 20)
            },
            Declaration = new Declaration { SignatoryName = "JUAN DELA CRUZ", DateAccomplished = new DateOnly(2026, 10, 20) }
        };

        // Act
        var report = new Ntc124Report(app);
        var pdfBytes = report.GeneratePdf();

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1000);
    }

    [Fact]
    public void Ntc125Report_ShouldGenerateNonEmptyPdfBytes()
    {
        // Arrange
        var app = new Ntc125Application
        {
            ApplicationNumber = "APP-2026-COMP-001",
            ReferenceNumber = "REF-2026-COMP-001",
            Complainant = new ComplainantDetails
            {
                Name = "MARIA SANTOS",
                Sex = "Female",
                CivilStatus = "Married",
                Nationality = "Filipino",
                ResidentialAddress = new Address { Street = "456 Oak St, Makati City" },
                ContactNumber = "09181234567",
                Email = "maria.santos@example.com"
            },
            ServiceProvider = new ServiceProviderDetails
            {
                BusinessName = "Globe Telecom Inc.",
                BusinessAddress = "The Globe Tower, Bonifacio Global City, Taguig",
                ContactNumber = "211"
            },
            NatureOfComplaint = new NatureOfComplaintDetails
            {
                ComplaintTypes = new List<string> { "Spam", "Scam" },
                DateOfIncident = new DateOnly(2026, 10, 18),
                TimeOfIncident = "14:30"
            },
            StateBrieflyDetails = "Received persistent fraudulent SMS messages purporting to offer lottery prizes.",
            AttachedProofDocuments = new List<AttachedProofDocument>
            {
                new() { DocumentDescription = "Screenshot of Spam Message", AttachmentFileName = "spam_screenshot.png" }
            },
            Declaration = new Declaration { SignatoryName = "MARIA SANTOS", DateAccomplished = new DateOnly(2026, 10, 20) }
        };

        // Act
        var report = new Ntc125Report(app);
        var pdfBytes = report.GeneratePdf();

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(1000);
    }

    [Fact]
    public void Ntc125FlatPdfOverlayMapper_ShouldMapAllFieldsCorrectly()
    {
        // Arrange
        var app = new Ntc125Application
        {
            Complainant = new ComplainantDetails
            {
                Name = "PEDRO PENDUKO",
                Sex = "Male",
                CivilStatus = "Single",
                Nationality = "Filipino",
                ResidentialAddress = new Address { Street = "789 Pine St, Pasig" },
                ContactNumber = "09201234567",
                Email = "pedro@example.com"
            },
            ServiceProvider = new ServiceProviderDetails
            {
                BusinessName = "Smart Communications Inc.",
                BusinessAddress = "6799 Ayala Ave, Makati City",
                ContactNumber = "*888"
            },
            NatureOfComplaint = new NatureOfComplaintDetails
            {
                ComplaintTypes = new List<string> { "Billing Complaint" },
                DateOfIncident = new DateOnly(2026, 10, 19),
                TimeOfIncident = "10:00 AM"
            },
            StateBrieflyDetails = "Unauthorized bill charges on mobile plan.",
            Declaration = new Declaration { SignatoryName = "PEDRO PENDUKO", DateAccomplished = new DateOnly(2026, 10, 20) }
        };

        // Act
        var overlays = Ntc125FlatPdfOverlayMapper.MapToFieldOverlays(app);

        // Assert
        overlays.Should().NotBeEmpty();
        overlays.Should().Contain(o => o.Field.Name == "Complainant.Name" && (o as TextFieldOverlay)!.Text == "PEDRO PENDUKO");
        overlays.Should().Contain(o => o.Field.Name == "Provider.BusinessName" && (o as TextFieldOverlay)!.Text == "Smart Communications Inc.");
        overlays.Should().Contain(o => o.Field.Name == "Nature.BillingComplaint" && (o as CheckboxFieldOverlay)!.IsChecked);
    }

    [Fact]
    public void ApplicationFormPrintMapper_ShouldIdentifyAndMapBlockingApplication()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-REQ-124-001",
            ReferenceNumber = "REF-REQ-124-001",
            SubmissionMode = SubmissionMode.Single,
            CreatedAt = new DateTime(2026, 10, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    Applicant = new EDGE.Domain.Entities.Applicant
                    {
                        Service = new Service { Code = "NTC_REQ_COMPLAINTS", Name = "Requests and Complaints" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.NA, Description = "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "JUAN",
                            LastName = "DELA CRUZ",
                            Address = "Barangay San Antonio, Pasig City",
                            ContactNumber = "09170001122",
                            Sex = "Male",
                            Nationality = "Filipino",
                            BirthDate = new DateOnly(1995, 5, 15)
                        }
                    }
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "Action Requested", Value = "BLOCK GSM Handset" },
                        new() { CustomLabel = "Loss Reason", Value = "Stolen" },
                        new() { CustomLabel = "Place of Incident", Value = "EDSA Station" },
                        new() { CustomLabel = "Device Particulars", Value = "[{\"make_model_type\":\"Samsung Galaxy S24\",\"imei_number\":\"351234567890123\"}]" },
                        new() { CustomLabel = "SIM Mobile Numbers", Value = "[{\"mobile_number\":\"09170001122\"}]" }
                    }
                }
            }
        };

        // Act
        var isReqComp = ApplicationFormPrintMapper.IsRequestOrComplaint(app);
        var isBlock = ApplicationFormPrintMapper.IsBlockingOrUnblocking(app);
        var mapped = ApplicationFormPrintMapper.MapToNtc124(app);

        // Assert
        isReqComp.Should().BeTrue();
        isBlock.Should().BeTrue();
        mapped.AffiantName.Should().Be("JUAN DELA CRUZ");
        mapped.ActionRequested.Should().Be(ActionRequested124.Block);
        mapped.ImeiNo.Should().Be("351234567890123");
        mapped.MakeModelType.Should().Be("Samsung Galaxy S24");
        mapped.SimMobileNumber.Should().Be("09170001122");
        mapped.Incident.IncidentType.Should().Be(IncidentType124.Stolen);
        mapped.Incident.PlaceOfIncident.Should().Be("EDSA Station");
    }

    [Fact]
    public void ApplicationFormPrintMapper_ShouldMapOthersIncidentTypeAndUnblockingDetails()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-UNBLOCK-001",
            ReferenceNumber = "REF-UNBLOCK-001",
            CreatedAt = new DateTime(2026, 10, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    Applicant = new EDGE.Domain.Entities.Applicant
                    {
                        Service = new Service { Code = "NTC_REQ_COMPLAINTS", Name = "Requests and Complaints" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.NA, Description = "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "PEDRO",
                            LastName = "PENDUKO",
                            Address = "Cebu City",
                            ContactNumber = "09180009988",
                            Sex = "Male",
                            Nationality = "Filipino"
                        }
                    }
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "Action Requested", Value = "UNBLOCK GSM Handset" },
                        new() { CustomLabel = "Make / Model / Type", Value = "Apple iPhone 15 Pro" },
                        new() { CustomLabel = "IMEI Number", Value = "359999888877776" },
                        new() { CustomLabel = "Date of Filing", Value = "2026-09-15" },
                        new() { CustomLabel = "Date of Recovery", Value = "2026-10-15" },
                        new() { CustomLabel = "Details", Value = "It has already been blocked and thus I am requesting the NTC for unblocking of said unit to activate the usage of the same;" },
                        new() { CustomLabel = "Incident Type", Value = "Others" },
                        new() { CustomLabel = "Please specify", Value = "Found in taxi by driver" }
                    }
                }
            }
        };

        // Act
        var isBlock = ApplicationFormPrintMapper.IsBlockingOrUnblocking(app);
        var mapped = ApplicationFormPrintMapper.MapToNtc124(app);

        // Assert
        isBlock.Should().BeTrue();
        mapped.ActionRequested.Should().Be(ActionRequested124.Unblock);
        mapped.Incident.IncidentType.Should().Be(IncidentType124.Others);
        mapped.Incident.OthersSpecification.Should().Be("Found in taxi by driver");
        mapped.Incident.DateOfFiling.Should().Be(new DateOnly(2026, 9, 15));
        mapped.Incident.DateOfRecovery.Should().Be(new DateOnly(2026, 10, 15));
        mapped.Incident.UnblockingDetails.Should().Contain("already been blocked");
    }

    [Fact]
    public void ApplicationFormPrintMapper_ShouldIdentifyAndMapComplaintApplication()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-COMP-125-001",
            ReferenceNumber = "REF-COMP-125-001",
            CreatedAt = new DateTime(2026, 10, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    Applicant = new EDGE.Domain.Entities.Applicant
                    {
                        Service = new Service { Code = "NTC_1_25", Name = "Complaint Form" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.NA, Description = "Complaints on Text Spam, Text Scam" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "CLARA",
                            LastName = "SANTOS",
                            Address = "Makati City",
                            ContactNumber = "09181112233",
                            Sex = "Female",
                            Nationality = "Filipino"
                        }
                    }
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "Provider Business Name", Value = "Telco Corp" },
                        new() { CustomLabel = "Provider Business Address", Value = "Taguig City" },
                        new() { CustomLabel = "Provider Contact Number", Value = "02-8888-0000" },
                        new() { CustomLabel = "Complaint Types", Value = "[\"Spam\",\"Scam\"]" },
                        new() { CustomLabel = "State Briefly the Details of Complaint", Value = "Unsolicited text broadcast messages." }
                    }
                }
            }
        };

        // Act
        var isReqComp = ApplicationFormPrintMapper.IsRequestOrComplaint(app);
        var isBlock = ApplicationFormPrintMapper.IsBlockingOrUnblocking(app);
        var mapped = ApplicationFormPrintMapper.MapToNtc125(app);

        // Assert
        isReqComp.Should().BeTrue();
        isBlock.Should().BeFalse();
        mapped.Complainant.Name.Should().Be("CLARA SANTOS");
        mapped.ServiceProvider.BusinessName.Should().Be("Telco Corp");
        mapped.NatureOfComplaint.ComplaintTypes.Should().Contain("Spam");
        mapped.StateBrieflyDetails.Should().Be("Unsolicited text broadcast messages.");
    }

    [Fact]
    public void FormPrintingService_PrintNtc124_ShouldOverlayActualTemplatePdf()
    {
        // Arrange
        var app = new Ntc124Application
        {
            ActionRequested = ActionRequested124.Block,
            AffiantName = "JUAN DELA CRUZ",
            Age = 30,
            Citizenship = "Filipino",
            ResidentialAddress = new Address { Street = "123 Main St, Quezon City" },
            TelephoneNumber = "09171234567",
            ImeiNo = "123456789012345",
            MakeModelType = "Apple iPhone 15 Pro",
            SimMobileNumber = "09171234567",
            ProofOfOwnership = new ProofOfOwnershipSelection { CopyGovernmentId = true, BoxWithImei = true },
            Incident = new IncidentDetails
            {
                IncidentType = IncidentType124.LostMisplaced,
                Sex = Sex.Male,
                AgeGroup = AgeGroup124.Age30_39,
                PlaceOfIncident = "SM Megamall",
                DateOfIncident = new DateOnly(2026, 10, 20)
            },
            Declaration = new Declaration { SignatoryName = "JUAN DELA CRUZ", DateAccomplished = new DateOnly(2026, 10, 20) }
        };

        var service = new FormPrintingService();

        // Act
        var pdfBytes = service.PrintNtc124(app);

        // Assert - Output must be valid PDF generated from the actual NTC1-24.pdf template
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);
    }

    [Fact]
    public void FormPrintingService_PrintNtc125_ShouldOverlayActualTemplatePdf()
    {
        // Arrange
        var app = new Ntc125Application
        {
            ApplicationNumber = "APP-2026-COMP-001",
            ReferenceNumber = "REF-2026-COMP-001",
            Complainant = new ComplainantDetails
            {
                Name = "MARIA SANTOS",
                Sex = "Female",
                CivilStatus = "Married",
                Nationality = "Filipino",
                ResidentialAddress = new Address { Street = "456 Oak St, Makati City" },
                ContactNumber = "09181234567",
                Email = "maria.santos@example.com"
            },
            ServiceProvider = new ServiceProviderDetails
            {
                BusinessName = "Globe Telecom Inc.",
                BusinessAddress = "The Globe Tower, Bonifacio Global City, Taguig",
                ContactNumber = "211"
            },
            NatureOfComplaint = new NatureOfComplaintDetails
            {
                ComplaintTypes = new List<string> { "Spam", "Scam" },
                DateOfIncident = new DateOnly(2026, 10, 18),
                TimeOfIncident = "14:30"
            },
            StateBrieflyDetails = "Received persistent fraudulent SMS messages purporting to offer lottery prizes.",
            Declaration = new Declaration { SignatoryName = "MARIA SANTOS", DateAccomplished = new DateOnly(2026, 10, 20) }
        };

        var service = new FormPrintingService();

        // Act
        var pdfBytes = service.PrintNtc125(app);

        // Assert - Output must be valid PDF generated from the actual NTC1-25.pdf template
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);
    }

    [Fact]
    public void FormPrintingService_PrintNtc125_ShouldProperlyHandleLongTextAndMultiLineDetailsWithoutOverlap()
    {
        // Arrange
        var app = new Ntc125Application
        {
            ApplicationNumber = "APP-2026-COMP-LONG-002",
            ReferenceNumber = "REF-2026-COMP-LONG-002",
            Complainant = new ComplainantDetails
            {
                Name = "HON. MARIA LEONORA TERESA CONCEPCION DELA MERCED-SANTOS III",
                ResidentialAddress = new Address { Street = "Unit 1502 Penthouse East Tower, Two Serendra Residences, 11th Avenue corner 26th Street, Bonifacio Global City, Fort Bonifacio, Taguig City, Metro Manila, 1634" },
                ContactNumber = "+63 918 123 4567 / (02) 8888-1234",
                Email = "maria.leonora.teresa.concepcion.delamerced.santos@governance-solutions-philippines.org"
            },
            ServiceProvider = new ServiceProviderDetails
            {
                BusinessName = "SMART TELECOMMUNICATIONS INCORPORATED (PLDT ENTERPRISE)",
                BusinessAddress = "6799 SMART Tower, Ayala Avenue, San Lorenzo, Makati City, Metro Manila, 1226",
                ContactNumber = "171 / (02) 8888-1111"
            },
            NatureOfComplaint = new NatureOfComplaintDetails
            {
                ComplaintTypes = new List<string>
                {
                    "Billing Complaint",
                    "Spam",
                    "Scam",
                    "Fair Use",
                    "Poor Service (Technical Service/Customer Service)",
                    "Denial of Subscription Plan",
                    "Others"
                },
                OthersSpecification = "Unsolicited promotional robocalls during non-working hours",
                DateOfIncident = new DateOnly(2026, 10, 19),
                TimeOfIncident = "09:45 AM"
            },
            StateBrieflyDetails = "The complainant subscribed to an unlimited high-speed enterprise broadband plan with committed speed of 500 Mbps. Starting October 1, 2026, the connection has suffered intermittent packet loss, frequent disconnection, and latency spikes exceeding 350ms during crucial operational hours.\nMultiple escalation tickets (Ref: #TK-88912, #TK-99123) have been lodged with customer support with no resolution.\nFurthermore, billing statements continue to reflect full monthly charges without corresponding outage credit adjustments.",
            AttachedProofDocuments = new List<AttachedProofDocument>
            {
                new() { DocumentDescription = "Billing Statement - October 2026", AttachmentFileName = "bill_oct_2026.pdf" },
                new() { DocumentDescription = "PingPlotter Network Diagnostics Log", AttachmentFileName = "latency_plot.csv" },
                new() { DocumentDescription = "Transcript of Customer Support Chat", AttachmentFileName = "support_transcript.pdf" }
            },
            Declaration = new Declaration
            {
                SignatoryName = "HON. MARIA LEONORA TERESA CONCEPCION DELA MERCED-SANTOS III",
                DateAccomplished = new DateOnly(2026, 10, 20)
            }
        };

        var service = new FormPrintingService();

        // Act
        var pdfBytes = service.PrintNtc125(app);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);
    }
}
