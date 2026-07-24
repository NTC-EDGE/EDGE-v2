using System;
using System.Collections.Generic;
using System.IO;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services;
using EDGE.Infrastructure.Printing.Services.Fields;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class PdfFieldRendererTests
{
    [Fact]
    public void MapToFieldOverlays_ShouldMapNtc120ApplicantDetailsAndVasServicesCorrectly()
    {
        // Arrange
        var app = new Ntc120Application
        {
            TypeOfApplication = TypeOfApplication.New,
            Applicant = new Applicant
            {
                Name = "Acme Telecom Inc.",
                ContactNumber = "09171234567",
                Email = "contact@acme.com",
                Address = new Address
                {
                    UnitRoomBldgNo = "Suite 101",
                    Street = "Main St",
                    CityMunicipality = "Makati"
                }
            },
            VasServices = new VasServicesSelection
            {
                MessagingService = true,
                HostingService = true
            },
            Declaration = new Declaration
            {
                SignatoryName = "John Doe",
                DateAccomplished = new DateOnly(2026, 7, 24)
            }
        };

        // Act
        IReadOnlyList<FieldOverlay> overlays = Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(app);

        // Assert
        overlays.Should().NotBeEmpty();

        // Check TypeOfApplication checkmark
        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "TypeOfApplication.New")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        // Check Applicant Name text overlay
        overlays.Should().ContainSingle(o => o is TextFieldOverlay && o.Field.Name == "Applicant.Name")
            .Which.As<TextFieldOverlay>().Text.Should().Be("Acme Telecom Inc.");

        // Check VAS Services checkmarks
        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "VasServices.MessagingService")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        overlays.Should().ContainSingle(o => o is CheckboxFieldOverlay && o.Field.Name == "VasServices.HostingService")
            .Which.As<CheckboxFieldOverlay>().IsChecked.Should().BeTrue();

        // Check Declaration Signatory
        overlays.Should().ContainSingle(o => o is TextFieldOverlay && o.Field.Name == "Declaration.SignatoryName")
            .Which.As<TextFieldOverlay>().Text.Should().Be("John Doe");
    }

    [Fact]
    public void PdfFieldRenderer_ShouldSortOverlaysByZIndexAscending()
    {
        // Arrange
        var renderer = new PdfFieldRenderer();

        var field = new PdfField("TestField", 100, 100);
        var item1 = new TextFieldOverlay(field, "Top Layer", ZIndex: 10);
        var item2 = new TextFieldOverlay(field, "Bottom Layer", ZIndex: 1);

        var overlays = new List<FieldOverlay> { item1, item2 };

        // Act & Assert
        Action act = () => renderer.RenderOverlays(null!, overlays);
        act.Should().Throw<NullReferenceException>();
    }

    [Theory]
    [InlineData("ntc-1-01.pdf", "ntc101")]
    [InlineData("ntc-1-02.pdf", "ntc102")]
    [InlineData("ntc-1-03.pdf", "ntc103")]
    [InlineData("ntc-1-04.pdf", "ntc104")]
    [InlineData("ntc-1-05.pdf", "ntc105")]
    [InlineData("ntc-1-09.pdf", "ntc109")]
    [InlineData("ntc-1-10.pdf", "ntc110")]
    [InlineData("ntc-1-11.pdf", "ntc111")]
    [InlineData("ntc-1-14.pdf", "ntc114")]
    [InlineData("ntc-1-18.pdf", "ntc118")]
    [InlineData("ntc-1-19.pdf", "ntc119")]
    [InlineData("ntc-1-20.pdf", "ntc120")]
    public void GenerateSamplePdfs_ForAllApplications(string templateName, string formKey)
    {
        // Arrange
        var fillerService = new PdfFormFillerService();
        var templateBytes = fillerService.GetTemplate(templateName);

        if (templateBytes == null || templateBytes.Length == 0)
            return;

        IReadOnlyList<FieldOverlay> overlays = CreateSampleOverlaysForForm(formKey);
        overlays.Should().NotBeEmpty();

        // 1. Render Production PDF (Debug = false)
        byte[] cleanPdf = fillerService.OverlayFields(templateBytes, overlays, new OverlayDebugOptions { Enabled = false });

        // 2. Render Debug PDF (Debug = true with grid, crosshairs, field names, and bounding boxes)
        byte[] debugPdf = fillerService.OverlayFields(templateBytes, overlays, new OverlayDebugOptions
        {
            Enabled = true,
            DrawGrid = true,
            DrawCrosshair = true,
            DrawCoordinates = true,
            DrawFieldNames = true,
            DrawBoundingBoxes = true
        });

        cleanPdf.Should().NotBeEmpty();
        debugPdf.Should().NotBeEmpty();

        // Safely write sample artifact files if output directory exists
        string outputDir = @"C:\Users\almau\.gemini\antigravity\brain\33ec9edb-ff92-46a3-8df5-418f0a21c9a0";
        if (Directory.Exists(outputDir))
        {
            TryWriteFile(Path.Combine(outputDir, $"{formKey}_clean_output.pdf"), cleanPdf);
            TryWriteFile(Path.Combine(outputDir, $"{formKey}_debug_output.pdf"), debugPdf);
        }
    }

    private static IReadOnlyList<FieldOverlay> CreateSampleOverlaysForForm(string formKey)
    {
        return formKey switch
        {
            "ntc101" => Ntc101FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc101Application
            {
                ExamCode = ExamCode.Rtg1_Elements1_2_5_6_Code2520Wpm,
                DateOfExam = new DateOnly(2026, 8, 1),
                ApplicantPerson = new ApplicantPerson
                {
                    LastName = "DELA CRUZ",
                    FirstName = "JUAN",
                    MiddleName = "SANTOS",
                    DateOfBirth = new DateOnly(1995, 5, 20),
                    Sex = Sex.Male,
                    Nationality = "FILIPINO",
                    Address = new Address { UnitRoomBldgNo = "123", Street = "Rizal Ave", Barangay = "Poblacion", CityMunicipality = "Manila", Province = "Metro Manila", ZipCode = "1000" },
                    ContactNumber = "09171234567",
                    Email = "juan@example.com",
                    SchoolAttended = "State University",
                    CourseTaken = "BS Electronics Engineering",
                    YearGraduated = 2017
                },
                Declaration = new Declaration { SignatoryName = "JUAN DELA CRUZ", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-101-001", OrDate = new DateOnly(2026, 7, 24), Amount = 500.00m, CollectingOfficer = "MARIA SANTOS" },
                AdmissionSlip = new AdmissionSlip { ExamineeName = "JUAN DELA CRUZ", ExaminationFor = "RTG1", PlaceOfExam = "NTC Central", DateOfExam = new DateOnly(2026, 8, 1), TimeOfExam = "8:00 AM" }
            }),

            "ntc102" => Ntc102FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc102Application
            {
                TypeOfApplication = TypeOfApplication.New,
                TypeOfCertificate = TypeOfCertificate.Rtg1,
                ApplicantPerson = new ApplicantPerson102
                {
                    LastName = "DELA CRUZ",
                    FirstName = "JUAN",
                    MiddleName = "SANTOS",
                    DateOfBirth = new DateOnly(1995, 5, 20),
                    Sex = Sex.Male,
                    HeightCm = 175,
                    WeightKg = 70,
                    Nationality = "FILIPINO",
                    EmploymentStatus = EmploymentStatus.EmployedLocal,
                    Address = new Address { UnitRoomBldgNo = "123", Street = "Rizal Ave", Barangay = "Poblacion", CityMunicipality = "Manila", Province = "Metro Manila", ZipCode = "1000" },
                    ContactNumber = "09171234567",
                    Email = "juan@example.com"
                },
                ExamSeminarDetails = new ExamSeminarDetails { PlaceOfExamSeminar = "NTC Central", Date = new DateOnly(2026, 8, 1), Rating = "88.5%" },
                Declaration = new Declaration { SignatoryName = "JUAN DELA CRUZ", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-102-001", OrDate = new DateOnly(2026, 7, 24), Amount = 600.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc103" => Ntc103FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc103Application
            {
                TypeOfApplication = TypeOfApplication.New,
                TypeOfPermitLicenseCert = TypeOfPermitLicenseCert103.AmateurRadioOperatorCertificate,
                ClassOfStation = ClassOfStationAmateur.ClassA,
                ApplicantPerson = new ApplicantPerson
                {
                    LastName = "REYES",
                    FirstName = "PEDRO",
                    MiddleName = "GARCIA",
                    DateOfBirth = new DateOnly(1990, 3, 15),
                    Sex = Sex.Male,
                    Nationality = "FILIPINO",
                    Address = new Address { UnitRoomBldgNo = "456", Street = "Katipunan Ave", Barangay = "Loyola", CityMunicipality = "Quezon City", Province = "Metro Manila", ZipCode = "1108" },
                    ContactNumber = "09189876543",
                    Email = "pedro@example.com"
                },
                CallSign = "DU1AAA",
                AtrocArslNo = "ARSL-2026-01",
                Validity = new DateOnly(2029, 3, 15),
                ExamSeminarDetails = new ExamSeminarDetails { PlaceOfExamSeminar = "Quezon City", Date = new DateOnly(2026, 6, 10), Rating = "92.0%" },
                Equipment = new List<Equipment>
                {
                    new Equipment { Make = "Icom", TypeModel = "IC-7300", SerialNumber = "SN-98765", FrequencyRange = "HF / 50MHz" }
                },
                Declaration = new Declaration { SignatoryName = "PEDRO REYES", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-103-001", OrDate = new DateOnly(2026, 7, 24), Amount = 750.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc104" => Ntc104FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc104Application
            {
                TypeOfApplication = TypeOfApplication.New,
                TypeOfPermitLicenseCert = TypeOfPermitLicenseCert104.ShipStationLicense,
                VesselCategory = VesselCategory.Ship,
                TradingRoute = TradingRoute.Domestic,
                Applicant = new Applicant
                {
                    Name = "PHILIPPINE SHIPPING LINES INC.",
                    ContactNumber = "02-8555-1234",
                    Email = "ops@philshipping.com",
                    Address = new Address { UnitRoomBldgNo = "Pier 4", Street = "North Harbor", Barangay = "Tondo", CityMunicipality = "Manila", Province = "Metro Manila", ZipCode = "1012" }
                },
                ShipDetails = new ShipDetails
                {
                    NameOfShipVessel = "M/V PHILIPPINE STAR",
                    CallSign = "DU2BBB",
                    MmsiNo = "548123456",
                    StationLicenseNo = "SSL-2026-05",
                    ImoNo = "IMO9876543",
                    Validity = new DateOnly(2027, 7, 24)
                },
                Equipment = new List<Equipment>
                {
                    new Equipment { RadioEquipment = "VHF Marine Radiotelephone", Make = "Furuno", TypeModel = "FM-8900S", SerialNumber = "SN-112233", PowerOutput = "25W" }
                },
                Operators = new List<RadioOperatorDetails>
                {
                    new RadioOperatorDetails { Name = "CAPTAIN JOHN SMITH", CertificateNumber = "GROC-1234", Validity = new DateOnly(2028, 12, 31) }
                },
                Declaration = new Declaration { SignatoryName = "PHILIPPINE SHIPPING LINES INC.", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-104-001", OrDate = new DateOnly(2026, 7, 24), Amount = 1500.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc105" => Ntc105FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc105Application
            {
                ApplicantName = "GLOBE TELECOM INC.",
                Equipment = new List<Equipment>
                {
                    new Equipment { RadioEquipment = "Microwave Transceiver", Make = "Ericsson", TypeModel = "MINI-LINK 6600", SerialNumber = "SN-ER-001", PowerOutput = "1W" },
                    new Equipment { RadioEquipment = "Base Station Unit", Make = "Nokia", TypeModel = "AirScale BTS", SerialNumber = "SN-NK-002", PowerOutput = "40W" }
                },
                Declaration = new Declaration { SignatoryName = "GLOBE TELECOM INC.", DateAccomplished = new DateOnly(2026, 7, 24) }
            }),

            "ntc109" => Ntc109FlatPdfOverlayMapper.MapToFieldOverlays(new PurchasePossessSellTransferApplication
            {
                TypeOfApplicationSpecific = TypeOfApplicationSpecific.Purchase,
                TypeOfRadioService = TypeOfRadioService.FixedAndLandMobile,
                NatureOfService = NatureOfService.CvPrivate,
                ClassOfStation = new ClassOfStation { RT = 2, FX = 1 },
                Applicant = new Applicant
                {
                    Name = "METRO LOGISTICS CORP",
                    ContactNumber = "02-8777-9999",
                    Email = "logistics@metrolog.ph",
                    Address = new Address { UnitRoomBldgNo = "Bldg A", Street = "EDSA", Barangay = "Wack-Wack", CityMunicipality = "Mandaluyong", Province = "Metro Manila", ZipCode = "1550" }
                },
                ProposedStation = new Station
                {
                    ExactLocation = "Mandaluyong Depot",
                    Longitude = "121.05",
                    Latitude = "14.58",
                    PointsOfCommServiceArea = "Metro Manila",
                    AssignedFreq = "148.125 MHz"
                },
                Equipment = new List<Equipment>
                {
                    new Equipment { Make = "Motorola", TypeModel = "XiR P8668i", SerialNumber = "SN-MOT-7788", PowerOutput = "5W", FrequencyRange = "136-174 MHz" }
                },
                SourceOfEquipment = new SourceOfEquipment { NameOfDealer = "Radio Communications Inc.", OrInvoiceNo = "INV-2026-44" },
                IntendedUse = IntendedUse.NewRadioStation,
                Declaration = new Declaration { SignatoryName = "METRO LOGISTICS CORP", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-109-001", OrDate = new DateOnly(2026, 7, 24), Amount = 1200.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc110" => Ntc110FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc110Application
            {
                ApplicantName = "SMART COMMUNICATIONS INC.",
                Entries = new List<Ntc110StationEntry>
                {
                    new Ntc110StationEntry
                    {
                        ProposedStation = new Station { ExactLocation = "Makati Tower 1", Longitude = "121.02", Latitude = "14.55", CallSign = "DX-1001", AssignedFreq = "1800 MHz" },
                        Equipment = new Equipment { Make = "Huawei", TypeModel = "DBS3900", SerialNumber = "SN-HW-1122", PowerOutput = "60W", FrequencyRange = "1710-1880 MHz" },
                        Antenna = new Antenna { Type = "Directional Panel", HeightM = 45, GainDbi = 18, Polarization = "Vertical" }
                    }
                },
                Declaration = new Declaration { SignatoryName = "SMART COMMUNICATIONS INC.", DateAccomplished = new DateOnly(2026, 7, 24) }
            }),

            "ntc111" => Ntc111FlatPdfOverlayMapper.MapToFieldOverlays(new ConstructionPermitApplication
            {
                TypeOfApplication = TypeOfApplication.New,
                PermitSubtype = PermitSubtype.ConstructionPermit,
                TypeOfRadioService = TypeOfRadioService.FixedAndLandMobile,
                NatureOfService = NatureOfService.CvPrivate,
                ClassOfStation = new ClassOfStation { FX = 2, FB = 1 },
                Applicant = new Applicant
                {
                    Name = "APO CEMENT CORPORATION",
                    ContactNumber = "032-230-1000",
                    Email = "info@apocement.com",
                    Address = new Address { UnitRoomBldgNo = "Plant Site", Street = "National Highway", Barangay = "Tinaan", CityMunicipality = "Naga", Province = "Cebu", ZipCode = "6037" }
                },
                Stations = new List<Station>
                {
                    new Station
                    {
                        ExactLocation = "Naga Plant Tower",
                        Longitude = "123.75",
                        Latitude = "10.21",
                        PointsOfCommServiceArea = "Plant Compound",
                        AssignedFreq = "450.250 MHz",
                        BwEmission = "11K0F3E",
                        Antenna = new Antenna { Type = "Yagi 5-Element", HeightM = 30, GainDbi = 10, DirectivityDegrees = 90 }
                    }
                },
                Equipment = new List<Equipment>
                {
                    new Equipment { Make = "Kenwood", TypeModel = "NXR-810", SerialNumber = "SN-KW-5544", PowerOutput = "25W", FrequencyRange = "400-470 MHz" }
                },
                Declaration = new Declaration { SignatoryName = "APO CEMENT CORPORATION", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-111-001", OrDate = new DateOnly(2026, 7, 24), Amount = 2000.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc114" => Ntc114FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc114Application
            {
                NatureOfService = NatureOfService114.CV,
                TypeOfRadioService = TypeOfRadioService114.FixedAndLandMobile,
                ClassOfStation = new ClassOfStation { FX = 1, ML = 4 },
                Applicant = new Applicant
                {
                    Name = "CONVERGE ICT SOLUTIONS INC.",
                    ContactNumber = "02-8667-0888",
                    Email = "regulatory@convergeict.com",
                    Address = new Address { UnitRoomBldgNo = "Reliance IT Center", Street = "Reliance St", Barangay = "Brgy. Highway Hills", CityMunicipality = "Mandaluyong", Province = "Metro Manila", ZipCode = "1550" }
                },
                ProposedStation = new Station { ExactLocation = "Pasig POP", Longitude = "121.06", Latitude = "14.57", PointsOfCommServiceArea = "Pasig City", AssignedFreq = "5.8 GHz" },
                Equipment = new Equipment { Make = "Cambium", TypeModel = "PMP 450i", SerialNumber = "SN-CAM-3322", PowerOutput = "1W", FrequencyRange = "5150-5925 MHz" },
                Declaration = new Declaration { SignatoryName = "CONVERGE ICT SOLUTIONS INC.", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-114-001", OrDate = new DateOnly(2026, 7, 24), Amount = 1800.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc118" => Ntc118FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc118Application
            {
                TypeOfApplication = TypeOfApplication.New,
                PermitCategory = new PermitCategorySelection { RceCategory = true, RceDealer = true, MobilePhoneCategory = true, MpDealer = true },
                Applicant = new Applicant
                {
                    Name = "CELLULAR WORLD TRADING CORP.",
                    TypeOfEntity = EntityType.Corporation,
                    ContactNumber = "02-8244-5566",
                    Email = "sales@cellworld.ph",
                    Address = new Address { UnitRoomBldgNo = "Unit 502", Street = "Juan Luna St", Barangay = "Binondo", CityMunicipality = "Manila", Province = "Metro Manila", ZipCode = "1006" }
                },
                SupervisingEngineer = new RequiredPersonnel { Name = "ENG RYAN T. ALVAREZ", LicenseNo = "ECE-0054321", ValidityDate = new DateOnly(2028, 9, 30) },
                Technician = new RequiredPersonnel { Name = "MARK V. BAUTISTA", LicenseNo = "1ST-PHN-8899", ValidityDate = new DateOnly(2027, 5, 15) },
                Declaration = new Declaration { SignatoryName = "CELLULAR WORLD TRADING CORP.", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-118-001", OrDate = new DateOnly(2026, 7, 24), Amount = 3500.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            "ntc119" => Ntc119FlatPdfOverlayMapper.MapToFieldOverlays(new CertificateOfRegistrationApplication
            {
                EquipmentDeviceType = EquipmentDeviceType.WdnIndoor,
                Applicant = new Applicant
                {
                    Name = "TECHTRONICS SYSTEMS PHILIPPINES INC.",
                    ContactNumber = "02-8999-0000",
                    Email = "reg@techtronics.ph",
                    Address = new Address { UnitRoomBldgNo = "Bldg 3", Street = "Science Park", Barangay = "Diezmo", CityMunicipality = "Cabuyao", Province = "Laguna", ZipCode = "4025" }
                },
                PermitToImportNo = "PTI-2026-105",
                InvoiceNo = "INV-998877",
                CpcnPaRslNo = "RSL-2026-88",
                Validity = new DateOnly(2027, 12, 31),
                Devices = new List<Device>
                {
                    new Device { MakeTypeModel = "Cisco Catalyst 9300", Quantity = 10, SerialNumber = "SN-CSC-001 TO 010" },
                    new Device { MakeTypeModel = "Aruba AP-515 Wi-Fi 6 AP", Quantity = 25, SerialNumber = "SN-ARB-100 TO 124" }
                },
                Declaration = new Declaration { SignatoryName = "TECHTRONICS SYSTEMS PHILIPPINES INC.", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-119-001", OrDate = new DateOnly(2026, 7, 24), Amount = 2200.00m, CollectingOfficer = "MARIA SANTOS" }
            }),

            _ => Ntc120FlatPdfOverlayMapper.MapToFieldOverlays(new Ntc120Application
            {
                TypeOfApplication = TypeOfApplication.New,
                Applicant = new Applicant
                {
                    Name = "CLOUDTECH TELECOM PHILIPPINES INC.",
                    ContactNumber = "+63 2 8888 1234",
                    Email = "info@cloudtech.ph",
                    Address = new Address { UnitRoomBldgNo = "32nd Floor, Tower 1", Street = "Ayala Avenue", Barangay = "San Lorenzo", CityMunicipality = "Makati City", Province = "Metro Manila", ZipCode = "1226" }
                },
                RegistrationCategory = new RegistrationCategory120 { VasProvider = true, VoipProvider = true },
                VasServices = new VasServicesSelection { MessagingService = true, HostingService = true, ElectronicMailService = true, VirtualPrivateNetworkService = true },
                Declaration = new Declaration { SignatoryName = "MARIA CLARA SANTOS", DateAccomplished = new DateOnly(2026, 7, 24) },
                Payment = new Payment { OrNo = "OR-2026-98765", OrDate = new DateOnly(2026, 7, 24), Amount = 2450.00m, CollectingOfficer = "JUAN DE LA CRUZ" }
            })
        };
    }

    private static void TryWriteFile(string filePath, byte[] bytes)
    {
        try
        {
            File.WriteAllBytes(filePath, bytes);
        }
        catch (IOException)
        {
            // Ignore temporary file locking by background viewers during test execution
        }
    }
}
