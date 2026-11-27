using System;
using System.Collections.Generic;
using System.Text;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Services;
using FluentAssertions;
using QuestPDF.Infrastructure;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class ApplicationFormAll13PrintingTests
{
    private readonly IFormPrintingService _printingService;

    public ApplicationFormAll13PrintingTests()
    {
        QuestPDF.Settings.License = LicenseType.Community;
        _printingService = new FormPrintingService();
    }

    public static IEnumerable<object[]> All13CanonicalFormCases()
    {
        yield return new object[] { "NTC_1_01", "Admission Slip for Radio Operator Examination", "Exams", "Radiotelegraphy", "NTC_1_01" };
        yield return new object[] { "NTC_1_02", "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", "Certificates", "Commercial Radio Operator Certificate", "NTC_1_02" };
        yield return new object[] { "NTC_1_03", "CERTIFICATES IN THE AMATEUR SERVICE", "Certificates", "Amateur Radio Operator Certificate", "NTC_1_03" };
        yield return new object[] { "NTC_AMA_LICENSES", "LICENSE IN THE AMATEUR SERVICE", "Licenses", "Amateur Radio Station License", "NTC_1_03" };
        yield return new object[] { "NTC_1_04", "LICENSE IN THE MARITIME SERVICE", "Licenses", "Ship Station License Domestic Trade", "NTC_1_04" };
        yield return new object[] { "NTC_1_09", "PERMITS IN THE AMATEUR SERVICE", "Permits", "Amateur Radio Station Permit to Purchase", "NTC_1_09" };
        yield return new object[] { "NTC_FLM_PERMITS", "PERMITS TO FIXED AND LAND MOBILE STATIONS", "Permits", "Permit to Purchase (Private)", "NTC_1_09" };
        yield return new object[] { "NTC_1_11", "LICENSES FOR GOVERNMENT AND PRIVATE RADIO STATIONS IN THE FIXED AND LAND MOBILE SERVICE", "Licenses", "Radio Station License", "NTC_1_11" };
        yield return new object[] { "NTC_AERO_LICENSES", "LICENSE IN THE AERONAUTICAL SERVICE", "Licenses", "Aircraft Station License", "NTC_1_11" };
        yield return new object[] { "NTC_1_18", "Customer Premises Equipment Supplier Accreditation", "Accreditations", "MOBILE PHONES", "NTC_1_18" };
        yield return new object[] { "NTC_EQUIP_PERMITS", "PERMITS FOR RADIO COMMUNICATIONS EQUIPMENT", "Permits", "Dealer Permit", "NTC_1_18" };
        yield return new object[] { "NTC_1_19", "CERTIFICATE OF REGISTRATION FOR RFID, SRD, WDN, DEVICES- INDOOR", "Certificates", "For Dealers", "NTC_1_19" };
        yield return new object[] { "NTC_1_20", "CERTIFICATE OF REGISTRATION AS A VALUE-ADDED SERVICE (VAS) PROVIDER", "Certificates", "Certificate of Registration as a Value-Added Service (VAS) Provider (RENEWAL)", "NTC_1_20" };
        yield return new object[] { "NTC_1_21", "COPY OF CERTIFICATES", "Certificates", "Certified True Copy", "NTC_1_21" };
        yield return new object[] { "NTC_COPY_LICENSES", "COPY OF LICENSES", "Licenses", "Duplicate Copy", "NTC_1_21" };
        yield return new object[] { "NTC_1_22", "TVRO REGISTRATION CERTIFICATE", "Certificates", "TVRO Registration Certificate (Commercial)", "NTC_1_22" };
        yield return new object[] { "NTC_TVRO_CATV_LICENSES", "TVRO/CATV STATION LICENSE", "Licenses", "CATV Station License", "NTC_1_22" };
        yield return new object[] { "NTC_1_24", "Requests for Blocking and Unblocking of IMEI and SIM", "Requests and Complaints", "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone", "NTC_1_24" };
        yield return new object[] { "NTC_1_25", "Complaints of Consumers/Subscribers and Tape Preservation", "Requests and Complaints", "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages", "NTC_1_25" };
    }

    [Theory]
    [MemberData(nameof(All13CanonicalFormCases))]
    public void ResolveCanonicalFormCode_And_PrintApplicationForm_GeneratesValidPdf_ForAll13CanonicalForms(
        string serviceCode,
        string serviceName,
        string categoryName,
        string variantDescription,
        string expectedFormCode)
    {
        // Arrange
        var app = BuildSampleApplication(serviceCode, serviceName, categoryName, variantDescription);

        // Act
        var resolvedCode = ApplicationFormPrintMapper.ResolveCanonicalFormCode(app);
        var (pdfBytes, fileName, printedCode) = ApplicationFormPrintMapper.PrintApplicationForm(app, _printingService);

        // Assert
        resolvedCode.Should().Be(expectedFormCode);
        printedCode.Should().Be(expectedFormCode);
        fileName.Should().EndWith(".pdf");
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(50000);

        var header = Encoding.ASCII.GetString(pdfBytes, 0, 5);
        header.Should().Be("%PDF-");
        Encoding.ASCII.GetString(pdfBytes).Should().NotContain("QuestPDF",
            "all 13 official NTC application forms must use their real official NTC PDF template");
    }

    [Fact]
    public void PrintApplicationForm_SupportsPerApplicantSelection_InBulkApplications()
    {
        // Arrange
        var applicant1Id = Guid.NewGuid();
        var applicant2Id = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-BULK-2026-001",
            ReferenceNumber = "REF-BULK-2026-001",
            SubmissionMode = SubmissionMode.Bulk,
            CreatedAt = new DateTime(2026, 10, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    ApplicantId = applicant1Id,
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = applicant1Id,
                        Service = new Service { Code = "NTC_1_01", Name = "Admission Slip for Radio Operator Examination" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.FirstTaker, Description = "Radiotelegraphy" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "ALICE",
                            LastName = "REYES",
                            Address = "Quezon City",
                            ContactNumber = "09171112222",
                            EmailAddress = "alice@example.com"
                        }
                    }
                },
                new()
                {
                    ApplicantId = applicant2Id,
                    SequenceOrder = 2,
                    Applicant = new Applicant
                    {
                        Id = applicant2Id,
                        Service = new Service { Code = "NTC_1_02", Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.New, Description = "Commercial Radio Operator Certificate" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "BOB",
                            LastName = "SANTOS",
                            Address = "Makati City",
                            ContactNumber = "09183334444",
                            EmailAddress = "bob@example.com",
                            Height = 175,
                            Weight = 70
                        }
                    }
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    ApplicantId = applicant1Id,
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "School / University Attended", Value = "UP Diliman" },
                        new() { CustomLabel = "Course / Degree Program", Value = "BS ECE" },
                        new() { CustomLabel = "Year Graduated", Value = "2024" }
                    }
                },
                new()
                {
                    ApplicantId = applicant2Id,
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "Number of Years", Value = "3" },
                        new() { CustomLabel = "Seminar / Exam Address", Value = "NTC NCR" },
                        new() { CustomLabel = "Rating", Value = "89%" }
                    }
                }
            }
        };

        // Act
        var (pdf1, file1, code1) = ApplicationFormPrintMapper.PrintApplicationForm(app, _printingService, applicant1Id);
        var (pdf2, file2, code2) = ApplicationFormPrintMapper.PrintApplicationForm(app, _printingService, applicant2Id);
        var mapped101 = ApplicationFormPrintMapper.MapToNtc101(app, applicant1Id);
        var mapped102 = ApplicationFormPrintMapper.MapToNtc102(app, applicant2Id);

        // Assert
        code1.Should().Be("NTC_1_01");
        file1.Should().Contain("NTC_1-01");
        Encoding.ASCII.GetString(pdf1, 0, 5).Should().Be("%PDF-");
        mapped101.ApplicantPerson.FirstName.Should().Be("ALICE");
        mapped101.ApplicantPerson.SchoolAttended.Should().Be("UP Diliman");

        code2.Should().Be("NTC_1_02");
        file2.Should().Contain("NTC_1-02");
        Encoding.ASCII.GetString(pdf2, 0, 5).Should().Be("%PDF-");
        mapped102.ApplicantPerson.FirstName.Should().Be("BOB");
        mapped102.ExamSeminarDetails.Rating.Should().Be("89%");
    }

    [Fact]
    public void PrintApplicationForm_LiveDbShape_PopulatesNameGeographicAddressEducationScheduleAndRepeaterDetails()
    {
        var pool = EDGE.Infrastructure.Persistence.SeederData.CommonSeederData.GetFieldsPool();
        var applicantId = Guid.NewGuid();
        var brgy = new Barangay
        {
            Id = Guid.NewGuid(),
            Name = "Bajada",
            Municipality = new Municipality
            {
                Id = Guid.NewGuid(),
                Name = "Davao City",
                Province = new Province
                {
                    Id = Guid.NewGuid(),
                    Name = "Davao del Sur",
                    Region = new Region { Id = Guid.NewGuid(), Code = "ROXI", Name = "Region XI" }
                }
            }
        };

        // 1. NTC 1-01 where ApplicantDetail has empty FirstName/LastName (simulating form-field/User fallback)
        //    and FormSubmission is attached directly on Applicant.FormSubmission with real FieldIds & ambiguous labels
        var examApp = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-LIVE-101",
            CreatedAt = new DateTime(2026, 11, 20, 8, 0, 0, DateTimeKind.Utc),
            User = new User
            {
                FirstName = "MARIA",
                MiddleName = "CLARA",
                LastName = "REYES",
                Email = "maria.reyes@example.com",
                ContactNumber = "09179998888",
                Unit = "Unit 4B",
                ZipCode = "8000"
            },
            Schedule = new Schedule
            {
                Venue = "NTC Region XI Testing Hall",
                StartDate = new DateTime(2026, 12, 15, 0, 0, 0, DateTimeKind.Utc),
                StartTime = "09:00 AM",
                EndTime = "12:00 PM"
            },
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    ApplicantId = applicantId,
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = applicantId,
                        Service = new Service { Code = "NTC_1_01", Name = "Admission Slip for Radio Operator Examination" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.FirstTaker, Description = "1RTG" },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "",
                            LastName = "",
                            Address = "J.P. Laurel Avenue",
                            Barangay = brgy,
                            ZipCode = "8000",
                            SchoolAttended = "Ateneo de Davao University",
                            CourseTaken = "BS Electronics Engineering",
                            YearGraduated = "2023",
                            BirthDate = new DateOnly(1998, 4, 12),
                            Sex = "Female",
                            Nationality = "Filipino"
                        },
                        FormSubmission = new FormSubmission
                        {
                            Id = Guid.NewGuid(),
                            ApplicantId = applicantId,
                            FieldValues = new List<FormFieldValue>
                            {
                                new() { FieldId = pool["elements"].Id, Field = pool["elements"], Value = "1RTG - Elements 1, 2, 5, 6 & Code" }
                            }
                        }
                    }
                }
            }
        };

        var mapped101 = ApplicationFormPrintMapper.MapToNtc101(examApp, applicantId);
        mapped101.ApplicantPerson.FirstName.Should().Be("MARIA");
        mapped101.ApplicantPerson.MiddleName.Should().Be("CLARA");
        mapped101.ApplicantPerson.LastName.Should().Be("REYES");
        mapped101.ApplicantPerson.Address.UnitRoomBldgNo.Should().Be("Unit 4B");
        mapped101.ApplicantPerson.Address.Street.Should().Be("J.P. Laurel Avenue");
        mapped101.ApplicantPerson.Address.Barangay.Should().Be("Bajada");
        mapped101.ApplicantPerson.Address.CityMunicipality.Should().Be("Davao City");
        mapped101.ApplicantPerson.Address.Province.Should().Be("Davao del Sur");
        mapped101.ApplicantPerson.Address.ZipCode.Should().Be("8000");
        mapped101.ApplicantPerson.SchoolAttended.Should().Be("Ateneo de Davao University");
        mapped101.ApplicantPerson.CourseTaken.Should().Be("BS Electronics Engineering");
        mapped101.ApplicantPerson.YearGraduated.Should().Be(2023);
        mapped101.AdmissionSlip.PlaceOfExam.Should().Be("NTC Region XI Testing Hall");
        mapped101.AdmissionSlip.TimeOfExam.Should().Be("09:00 AM - 12:00 PM");
        mapped101.DateOfExam.Should().Be(new DateOnly(2026, 12, 15));

        var (pdf101, _, _) = ApplicationFormPrintMapper.PrintApplicationForm(examApp, _printingService, applicantId);
        Encoding.ASCII.GetString(pdf101, 0, 5).Should().Be("%PDF-");
        Encoding.ASCII.GetString(pdf101).Should().NotContain("QuestPDF");

        // 2. NTC 1-02 with ambiguous canonical labels ("Date", "Type") matched via FieldId
        var certApplicantId = Guid.NewGuid();
        var certApp = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-LIVE-102",
            CreatedAt = new DateTime(2026, 11, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    ApplicantId = certApplicantId,
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = certApplicantId,
                        Service = new Service { Code = "NTC_1_02", Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.New, Description = "1PHN" },
                        ApplicantDetail = new ApplicantDetail { FirstName = "PEDRO", LastName = "CRUZ", Barangay = brgy },
                        FormSubmission = new FormSubmission
                        {
                            Id = Guid.NewGuid(),
                            ApplicantId = certApplicantId,
                            FieldValues = new List<FormFieldValue>
                            {
                                new() { FieldId = pool["employmentStatus"].Id, Field = pool["employmentStatus"], Value = "Employed" },
                                new() { FieldId = pool["employmentType"].Id, Field = pool["employmentType"], Value = "Foreign" },
                                new() { FieldId = pool["examSeminarDate"].Id, Field = pool["examSeminarDate"], Value = "2026-08-15" },
                                new() { FieldId = pool["examSeminarRating"].Id, Field = pool["examSeminarRating"], Value = "92.5%" }
                            }
                        }
                    }
                }
            }
        };

        var mapped102Live = ApplicationFormPrintMapper.MapToNtc102(certApp, certApplicantId);
        mapped102Live.ApplicantPerson.EmploymentStatus.Should().Be(EDGE.Infrastructure.Printing.Models.EmploymentStatus.EmployedForeign);
        mapped102Live.ExamSeminarDetails.Date.Should().Be(new DateOnly(2026, 8, 15));
        mapped102Live.ExamSeminarDetails.Rating.Should().Be("92.5%");

        // 3. NTC 1-09 with nested Form Builder 'particulars' repeater containing stationClass & equipments[]
        var permitApplicantId = Guid.NewGuid();
        var permitApp = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = "APP-LIVE-109",
            CreatedAt = new DateTime(2026, 11, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    ApplicantId = permitApplicantId,
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = permitApplicantId,
                        Service = new Service { Code = "NTC_1_09", Name = "PERMITS TO FIXED AND LAND MOBILE STATIONS" },
                        ServiceVariant = new ServiceVariant { Type = ServiceVariantType.New, Description = "Permit to Purchase" },
                        CompanyDetail = new CompanyDetail { Name = "MINDANAO RADIO CORP.", Address = "Rizal Street", Barangay = brgy },
                        FormSubmission = new FormSubmission
                        {
                            Id = Guid.NewGuid(),
                            ApplicantId = permitApplicantId,
                            FieldValues = new List<FormFieldValue>
                            {
                                new()
                                {
                                    FieldId = pool["particulars"].Id,
                                    Field = pool["particulars"],
                                    Value = "[{\"stationClass\":\"ML\",\"exactLocation\":\"Davao Port\",\"makeTypeModel\":\"ICOM IC-V86\",\"equipments\":[{\"serialNumber\":\"SN-IC-001\",\"frequencyRange\":\"136-174 MHz\",\"powerOutput\":\"7W\"}]}]"
                                }
                            }
                        }
                    }
                }
            }
        };

        var mapped109Live = ApplicationFormPrintMapper.MapToNtc109(permitApp, permitApplicantId);
        mapped109Live.Applicant.Name.Should().Be("MINDANAO RADIO CORP.");
        mapped109Live.Applicant.Address.Barangay.Should().Be("Bajada");
        mapped109Live.Applicant.Address.CityMunicipality.Should().Be("Davao City");
        mapped109Live.ClassOfStation.ML.Should().Be(1);
        mapped109Live.Equipment.Should().ContainSingle(e => e.Make == "ICOM IC-V86" && e.SerialNumber == "SN-IC-001" && e.PowerOutput == "7W");
    }

    private static Domain.Entities.Application BuildSampleApplication(
        string serviceCode,
        string serviceName,
        string categoryName,
        string variantDescription)
    {
        var applicantId = Guid.NewGuid();
        return new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            ApplicationNumber = $"APP-{serviceCode}-001",
            ReferenceNumber = $"REF-{serviceCode}-001",
            SubmissionMode = SubmissionMode.Single,
            CreatedAt = new DateTime(2026, 10, 20, 8, 0, 0, DateTimeKind.Utc),
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new()
                {
                    ApplicantId = applicantId,
                    SequenceOrder = 1,
                    Applicant = new Applicant
                    {
                        Id = applicantId,
                        Service = new Service
                        {
                            Code = serviceCode,
                            Name = serviceName,
                            ServiceCategory = new ServiceCategory { Name = categoryName }
                        },
                        ServiceVariant = new ServiceVariant
                        {
                            Type = ServiceVariantType.New,
                            Description = variantDescription
                        },
                        ApplicantDetail = new ApplicantDetail
                        {
                            FirstName = "JUAN",
                            MiddleName = "M.",
                            LastName = "DELA CRUZ",
                            Address = "123 Commonwealth Ave, Quezon City",
                            ContactNumber = "09171234567",
                            EmailAddress = "juan.delacruz@example.com",
                            Sex = "Male",
                            Nationality = "Filipino",
                            BirthDate = new DateOnly(1992, 6, 15),
                            Height = 170,
                            Weight = 68
                        }
                    }
                }
            },
            FormSubmissions = new List<FormSubmission>
            {
                new()
                {
                    ApplicantId = applicantId,
                    FieldValues = new List<FormFieldValue>
                    {
                        new() { CustomLabel = "Number of Years", Value = "3" },
                        new() { CustomLabel = "Vessel Name", Value = "M/V Filipinas" },
                        new() { CustomLabel = "Call Sign", Value = "DU1NTC" },
                        new() { CustomLabel = "Station Location / Coordinates", Value = "Quezon City" },
                        new() { CustomLabel = "Supervising Engineer", Value = "Engr. Maria Santos" },
                        new() { CustomLabel = "Certificate/ECT No.", Value = "PECE-001234" },
                        new() { CustomLabel = "Invoice Number", Value = "INV-2026-0091" },
                        new() { CustomLabel = "Registered Devices Details (WDN/SRD/RFID)", Value = "[{\"makeTypeModel\":\"Zebra FX9600\",\"quantity\":\"4\",\"serialNumber\":\"SN-9600-01\"}]" },
                        new() { CustomLabel = "CPCN / PA / CA No.", Value = "PA-2026-0101" },
                        new() { CustomLabel = "COR / VAS No.", Value = "VAS-2025-0022" },
                        new() { CustomLabel = "Value-Added Services / Category", Value = "Messaging Service, Hosting Service" },
                        new() { CustomLabel = "Certificate Number", Value = "ROC-2025-8812" },
                        new() { CustomLabel = "Circumstances Relating to Lost/Mutilation of Permit/License/Certificate", Value = "Misplaced during transit" },
                        new() { CustomLabel = "Exact Location of TVRO System", Value = "Diliman, Quezon City" },
                        new() { CustomLabel = "Longitude (deg-min-sec)", Value = "121 03 00 E" },
                        new() { CustomLabel = "Latitude (deg-min-sec)", Value = "14 39 00 N" },
                        new() { CustomLabel = "Action Requested", Value = "BLOCK GSM Handset" },
                        new() { CustomLabel = "Device Particulars", Value = "[{\"make_model_type\":\"Apple iPhone 15\",\"imei_number\":\"351234567890123\"}]" },
                        new() { CustomLabel = "SIM Card / Mobile Numbers", Value = "[{\"mobile_number\":\"09171234567\"}]" },
                        new() { CustomLabel = "Business Name", Value = "Sample Telco Provider" },
                        new() { CustomLabel = "Nature of Complaint", Value = "[\"Spam\",\"Billing Complaint\"]" },
                        new() { CustomLabel = "State Briefly the Details of Complaint", Value = "Unexplained charges on monthly statement." }
                    }
                }
            },
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    OpNumber = "OP-2026-001",
                    OfficialReceiptNumber = "OR-2026-77889",
                    AmountDue = 1500m,
                    AmountReceived = 1500m,
                    Status = OpStatus.Paid,
                    PaidAt = new DateTime(2026, 10, 20, 9, 0, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 20, 8, 30, 0, DateTimeKind.Utc)
                }
            }
        };
    }
}
