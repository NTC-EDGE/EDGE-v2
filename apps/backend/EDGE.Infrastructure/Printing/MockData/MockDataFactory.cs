using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.MockData;

/// <summary>
/// Stand-in for the real API/DB layer. Swap the body of GetConstructionPermitApplication
/// for an actual repository/service call once ApplicationService -> Service.Contract ->
/// FormSubmission is wired up (see NTC_Full_ERD_Documentation.md sections 2 & 4). The
/// shape returned here matches exactly what that call should eventually return, so
/// FormDocument / ConstructionPermitReport never need to change.
/// </summary>
public static partial class MockDataFactory
{
    public static ConstructionPermitApplication GetConstructionPermitApplication()
    {
        var applicationId = Guid.NewGuid();

        var applicant = new Applicant
        {
            ApplicantId = Guid.NewGuid(),
            Name = "Davao Coastal Communications, Inc.",
            TypeOfEntity = EntityType.Corporation,
            Address = new Address
            {
                UnitRoomBldgNo = "Unit 402, Pryce Tower",
                Street = "J.P. Laurel Avenue",
                Barangay = "Bajada",
                CityMunicipality = "Davao City",
                Province = "Davao del Sur",
                ZipCode = "8000"
            },
            ContactNumber = "+63 82 123 4567",
            Email = "compliance@davaocoastalcomms.ph"
        };

        var stations = new List<Station>
        {
            new Station
            {
                StationId = Guid.NewGuid(),
                ApplicationId = applicationId,
                ExactLocation = "Rooftop, Pryce Tower, J.P. Laurel Ave., Davao City",
                Longitude = "125.6128 E",
                Latitude = "7.0731 N",
                PointsOfCommServiceArea = "Davao City and adjacent municipalities",
                AssignedFreq = "440.125 MHz",
                BwEmission = "12.5 kHz / F3E",
                Configuration = "Base + Repeater",
                DataRate = "N/A",
                CallSign = "DZDC123",
                RslNo = "RSL-2026-00417",
                Validity = new DateOnly(2029, 6, 30),
                Others = "Co-located with existing cellular site, structural clearance on file",
                Antenna = new Antenna
                {
                    AntennaId = Guid.NewGuid(),
                    Type = "Omnidirectional Collinear",
                    HeightM = 45,
                    GainDbi = 9.5,
                    DirectivityDegrees = 360,
                    Diameter = "N/A",
                    Polarization = "Vertical",
                    BeamwidthDegrees = 360
                }
            },
            new Station
            {
                StationId = Guid.NewGuid(),
                ApplicationId = applicationId,
                ExactLocation = "Barangay Hall, Toril, Davao City",
                Longitude = "125.4981 E",
                Latitude = "6.9628 N",
                PointsOfCommServiceArea = "Toril District",
                AssignedFreq = "440.375 MHz",
                BwEmission = "12.5 kHz / F3E",
                Configuration = "Base",
                DataRate = "N/A",
                CallSign = "DZDC124",
                RslNo = "RSL-2026-00418",
                Validity = new DateOnly(2029, 6, 30),
                Others = "",
                Antenna = new Antenna
                {
                    AntennaId = Guid.NewGuid(),
                    Type = "Yagi Directional",
                    HeightM = 24,
                    GainDbi = 11.0,
                    DirectivityDegrees = 90,
                    Diameter = "N/A",
                    Polarization = "Vertical",
                    BeamwidthDegrees = 60
                }
            }
        };

        var equipment = new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                ApplicationId = applicationId,
                RadioEquipment = "VHF/UHF Base Repeater",
                Make = "Motorola Solutions",
                TypeModel = "MTR3000",
                SerialNumber = "MTR3K-88213-DC",
                PowerOutput = "40W",
                FrequencyRange = "440-470 MHz",
                Quantity = 1
            },
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                ApplicationId = applicationId,
                RadioEquipment = "Mobile Radio Transceiver",
                Make = "Motorola Solutions",
                TypeModel = "XPR 5550e",
                SerialNumber = "XPR55-44190-DC",
                PowerOutput = "25W",
                FrequencyRange = "440-470 MHz",
                Quantity = 6
            }
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0098231",
            OrDate = new DateOnly(2026, 7, 15),
            Amount = 12500.00m,
            CollectingOfficer = "R. Maquiling"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Engr. Liza P. Ramonal",
            DateAccomplished = new DateOnly(2026, 7, 15)
        };

        return new ConstructionPermitApplication
        {
            ApplicationId = applicationId,
            RevisionNo = "Rev. 2",
            RevisionDate = new DateOnly(2025, 3, 31),
            TypeOfApplication = TypeOfApplication.New,
            ModificationReason = null,
            NoOfYears = 3,
            Applicant = applicant,
            Equipment = equipment,
            Stations = stations,
            Payment = payment,
            Declaration = declaration,
            PermitSubtype = PermitSubtype.ConstructionPermit,
            TypeOfRadioService = TypeOfRadioService.FixedAndLandMobile,
            NatureOfService = NatureOfService.CvPrivate,
            ClassOfStation = new ClassOfStation { FX = 1, ML = 6 }
        };
    }

    public static PurchasePossessSellTransferApplication GetPurchasePossessSellTransferApplication()
    {
        var applicationId = Guid.NewGuid();

        var applicant = new Applicant
        {
            ApplicantId = Guid.NewGuid(),
            Name = "Samal Ferry Transport Cooperative",
            TypeOfEntity = EntityType.SingleProprietorship,
            Address = new Address
            {
                UnitRoomBldgNo = "",
                Street = "National Highway",
                Barangay = "Poblacion",
                CityMunicipality = "Island Garden City of Samal",
                Province = "Davao del Norte",
                ZipCode = "8119"
            },
            ContactNumber = "+63 917 555 2210",
            Email = "admin@samalferrytc.ph"
        };

        var equipment = new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                ApplicationId = applicationId,
                RadioEquipment = "Marine VHF Transceiver",
                Make = "Icom",
                TypeModel = "IC-M330GE",
                SerialNumber = "ICM330-77201",
                PowerOutput = "25W",
                FrequencyRange = "156-162 MHz",
                Quantity = 2
            },
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                ApplicationId = applicationId,
                RadioEquipment = "Class B AIS Transponder",
                Make = "Garmin",
                TypeModel = "AIS 800",
                SerialNumber = "GAR-AIS-99410",
                PowerOutput = "5W",
                FrequencyRange = "161.975-162.025 MHz",
                Quantity = 1
            }
        };

        var proposedStation = new Station
        {
            StationId = Guid.NewGuid(),
            ApplicationId = applicationId,
            ExactLocation = "M/L Samal Princess, home port Babak Terminal",
            Longitude = "125.7013 E",
            Latitude = "7.1235 N",
            PointsOfCommServiceArea = "Samal Strait / Davao Gulf crossing",
            AssignedFreq = "Ch. 16 / Ch. 06",
            BwEmission = "25 kHz / G3E",
            Configuration = "Fixed Marine Mobile",
            DataRate = "N/A",
            CallSign = "DUS6789",
            RslNo = "RSL-2026-00512",
            Validity = new DateOnly(2028, 2, 28),
            Others = ""
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0102344",
            OrDate = new DateOnly(2026, 7, 10),
            Amount = 3200.00m,
            CollectingOfficer = "J. Andalajao"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Rogelio S. Baldado",
            DateAccomplished = new DateOnly(2026, 7, 10)
        };

        return new PurchasePossessSellTransferApplication
        {
            ApplicationId = applicationId,
            RevisionNo = "Rev. 1",
            RevisionDate = new DateOnly(2024, 11, 15),
            TypeOfApplication = TypeOfApplication.New,
            NoOfYears = null,
            Applicant = applicant,
            Equipment = equipment,
            Payment = payment,
            Declaration = declaration,
            TypeOfApplicationSpecific = TypeOfApplicationSpecific.Purchase,
            TypeOfRadioService = TypeOfRadioService.MaritimePublicPrivateCoastal,
            NatureOfService = NatureOfService.CvPrivate,
            ClassOfStation = new ClassOfStation { MA = 2 },
            CpcCpcnPaRslNo = "N/A - New Application",
            Validity = new DateOnly(2028, 2, 28),
            ProposedStation = proposedStation,
            SourceOfEquipment = new SourceOfEquipment
            {
                NameOfDealer = "Marine Comms Davao Trading",
                OrInvoiceNo = "INV-2026-004471",
                AuthorizedSellerBuyer = "Marine Comms Davao Trading",
                PermitRslNo = "DLR-2025-00089"
            },
            IntendedUse = IntendedUse.NewRadioStation
        };
    }

    public static CertificateOfRegistrationApplication GetCertificateOfRegistrationApplication()
    {
        var applicationId = Guid.NewGuid();

        var applicant = new Applicant
        {
            ApplicantId = Guid.NewGuid(),
            Name = "Aeon Retail Solutions Corp.",
            TypeOfEntity = EntityType.Corporation,
            Address = new Address
            {
                UnitRoomBldgNo = "Level 3, Abreeza Business Park",
                Street = "J.P. Laurel Avenue",
                Barangay = "Bajada",
                CityMunicipality = "Davao City",
                Province = "Davao del Sur",
                ZipCode = "8000"
            },
            ContactNumber = "+63 82 300 8841",
            Email = "regulatory@aeonretail.ph"
        };

        var devices = new List<Device>
        {
            new Device
            {
                DeviceId = Guid.NewGuid(),
                MakeTypeModel = "Zebra RFID Reader FX9600",
                Quantity = 12,
                SerialNumber = "FX9600-BATCH-0031"
            },
            new Device
            {
                DeviceId = Guid.NewGuid(),
                MakeTypeModel = "Zebra RFID Tag Antenna AN720",
                Quantity = 24,
                SerialNumber = "AN720-BATCH-0031"
            }
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0091187",
            OrDate = new DateOnly(2026, 7, 8),
            Amount = 4500.00m,
            CollectingOfficer = "M. Villaester"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Carmela D. Uy",
            DateAccomplished = new DateOnly(2026, 7, 8)
        };

        return new CertificateOfRegistrationApplication
        {
            ApplicationId = applicationId,
            RevisionNo = "Rev. 1",
            RevisionDate = new DateOnly(2023, 9, 1),
            TypeOfApplication = TypeOfApplication.New,
            Applicant = applicant,
            Payment = payment,
            Declaration = declaration,
            EquipmentDeviceType = EquipmentDeviceType.Rfid,
            PermitToImportNo = "PTI-2026-00234",
            InvoiceNo = "INV-2026-009981",
            CpcnPaRslNo = "N/A",
            Validity = new DateOnly(2029, 7, 8),
            Devices = devices
        };
    }

    public static Ntc101Application GetNtc101Application()
    {
        var applicationId = Guid.NewGuid();

        var applicantPerson = new ApplicantPerson
        {
            LastName = "dela Cruz",
            FirstName = "Juan",
            MiddleName = "Dimalanta",
            DateOfBirth = new DateOnly(1998, 3, 14),
            Sex = Sex.Male,
            Nationality = "Filipino",
            Address = new Address
            {
                UnitRoomBldgNo = "Block 12, Lot 5",
                Street = "Sampaguita Street",
                Barangay = "Central",
                CityMunicipality = "Quezon City",
                Province = "Metro Manila",
                ZipCode = "1100"
            },
            ContactNumber = "+63 918 123 4567",
            Email = "juan.delacruz@email.ph",
            SchoolAttended = "University of the Philippines Diliman",
            CourseTaken = "BS Electrical Engineering",
            YearGraduated = 2020
        };

        var assistanceRequest = new AssistanceRequest
        {
            NeedsAssistance = false,
            Details = null
        };

        var admissionSlip = new AdmissionSlip
        {
            ExamineeName = "Juan D. dela Cruz",
            MailingAddressLine1 = "Block 12, Lot 5, Sampaguita Street, Central",
            MailingAddressLine2 = "Quezon City, Metro Manila 1100",
            ExaminationFor = "Restricted Radiotelephone Operator Certificate (RROC Aircraft)",
            PlaceOfExam = "NTC Central Office Examination Room",
            DateOfExam = new DateOnly(2026, 8, 15),
            TimeOfExam = "08:00 AM - 12:00 PM",
            AuthorizedOfficer = "E. Santos"
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0041120",
            OrDate = new DateOnly(2026, 7, 20),
            Amount = 1800.00m,
            CollectingOfficer = "E. Santos"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Juan D. dela Cruz",
            DateAccomplished = new DateOnly(2026, 7, 20)
        };

        return new Ntc101Application
        {
            ApplicationId = applicationId,
            RevisionNo = "Rev. 2",
            RevisionDate = new DateOnly(2025, 1, 10),
            TypeOfApplication = TypeOfApplication.New,
            ExamCode = ExamCode.RrocAircraft_Element1,
            DateOfExam = new DateOnly(2026, 8, 15),
            ApplicantPerson = applicantPerson,
            AssistanceRequest = assistanceRequest,
            AdmissionSlip = admissionSlip,
            Payment = payment,
            Declaration = declaration
        };
    }

    public static Ntc102Application GetNtc102Application()
    {
        var applicationId = Guid.NewGuid();

        var applicantPerson = new ApplicantPerson102
        {
            LastName = "Santos",
            FirstName = "Maria Clara",
            MiddleName = "Rizal",
            DateOfBirth = new DateOnly(1996, 5, 20),
            Sex = Sex.Female,
            HeightCm = 162,
            WeightKg = 54,
            Nationality = "Filipino",
            Address = new Address
            {
                UnitRoomBldgNo = "Apt 4B, Emerald Tower",
                Street = "F. Ortigas Jr. Road",
                Barangay = "San Antonio",
                CityMunicipality = "Pasig City",
                Province = "Metro Manila",
                ZipCode = "1605"
            },
            ContactNumber = "+63 917 888 3321",
            Email = "maria.santos@aviation.ph",
            EmploymentStatus = EmploymentStatus.EmployedLocal
        };

        var examSeminar = new ExamSeminarDetails
        {
            PlaceOfExamSeminar = "NTC Central Office Examination Center",
            Date = new DateOnly(2026, 6, 12),
            Rating = "88.5%"
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0087712",
            OrDate = new DateOnly(2026, 7, 18),
            Amount = 1950.00m,
            CollectingOfficer = "M. Villaester"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Maria Clara R. Santos",
            DateAccomplished = new DateOnly(2026, 7, 18)
        };

        return new Ntc102Application
        {
            ApplicationId = applicationId,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = TypeOfApplication.New,
            NoOfYears = 3,
            TypeOfCertificate = TypeOfCertificate.RrocAircraft,
            ApplicantPerson = applicantPerson,
            ExamSeminarDetails = examSeminar,
            Payment = payment,
            Declaration = declaration
        };
    }

    public static Ntc103Application GetNtc103Application()
    {
        var applicationId = Guid.NewGuid();

        var applicantPerson = new ApplicantPerson
        {
            LastName = "Rizal",
            FirstName = "Jose",
            MiddleName = "Mercado",
            DateOfBirth = new DateOnly(1992, 6, 19),
            Sex = Sex.Male,
            Nationality = "Filipino",
            Address = new Address
            {
                UnitRoomBldgNo = "House No. 125, Real Street",
                Street = "Poblacion",
                Barangay = "Calamba Central",
                CityMunicipality = "Calamba City",
                Province = "Laguna",
                ZipCode = "4027"
            },
            ContactNumber = "+63 919 555 7788",
            Email = "jose.rizal@amateur-radio.ph"
        };

        var examSeminar = new ExamSeminarDetails
        {
            PlaceOfExamSeminar = "NTC Regional Office IV-A, Lipa City",
            Date = new DateOnly(2026, 4, 15),
            Rating = "92.0%"
        };

        var equipment = new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                Make = "Yaesu",
                TypeModel = "FT-991A",
                SerialNumber = "YAE-991A-88412",
                FrequencyRange = "1.8 - 54 MHz / 144 - 440 MHz"
            },
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                Make = "Icom",
                TypeModel = "IC-7300",
                SerialNumber = "IC-7300-33019",
                FrequencyRange = "0.030 - 74.800 MHz"
            }
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0099410",
            OrDate = new DateOnly(2026, 7, 22),
            Amount = 2450.00m,
            CollectingOfficer = "E. Santos"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Jose M. Rizal",
            DateAccomplished = new DateOnly(2026, 7, 22)
        };

        return new Ntc103Application
        {
            ApplicationId = applicationId,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = TypeOfApplication.New,
            NoOfYears = 3,
            TypeOfPermitLicenseCert = TypeOfPermitLicenseCert103.AmateurRadioStationLicense,
            ClassOfStation = ClassOfStationAmateur.ClassA,
            CallSign = "DU1JR",
            AtrocArslNo = "ARSL-2026-00341",
            Validity = new DateOnly(2029, 7, 22),
            ApplicantPerson = applicantPerson,
            ExamSeminarDetails = examSeminar,
            Equipment = equipment,
            Payment = payment,
            Declaration = declaration
        };
    }

    public static Ntc104Application GetNtc104Application()
    {
        var applicationId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Name = "Supercat Fast Ferry Corporation",
            TypeOfEntity = EntityType.Corporation,
            Address = new Address
            {
                UnitRoomBldgNo = "Pier 4, North Harbor",
                Street = "Marcos Road",
                Barangay = "Barangay 120",
                CityMunicipality = "Tondo, Manila",
                Province = "Metro Manila",
                ZipCode = "1013"
            },
            ContactNumber = "+63 2 8527 7000",
            Email = "maritime.licensing@supercat.ph"
        };

        var shipDetails = new ShipDetails
        {
            NameOfShipVessel = "M/V St. Nuriel",
            CallSign = "DU2341",
            MmsiNo = "548011223",
            StationLicenseNo = "SSL-2026-00412",
            ImoNo = "IMO 9123456",
            Validity = new DateOnly(2029, 8, 10)
        };

        var equipment = new List<Equipment>
        {
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                RadioEquipment = "VHF Marine Transceiver",
                Make = "Furuno",
                TypeModel = "FM-8900S",
                SerialNumber = "FUR-8900S-9912",
                PowerOutput = "25 Watts"
            },
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                RadioEquipment = "Class A AIS Transponder",
                Make = "Furuno",
                TypeModel = "FA-170",
                SerialNumber = "FUR-FA170-4421",
                PowerOutput = "12.5 Watts"
            },
            new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                RadioEquipment = "Marine Radar",
                Make = "JRC",
                TypeModel = "JMA-5312",
                SerialNumber = "JRC-5312-7718",
                PowerOutput = "10 kW"
            }
        };

        var operators = new List<RadioOperatorDetails>
        {
            new RadioOperatorDetails
            {
                Name = "Capt. Fernando A. Magallanes",
                CertificateNumber = "1PHN-2024-00129",
                Validity = new DateOnly(2027, 5, 15)
            },
            new RadioOperatorDetails
            {
                Name = "Radio Offr. Juan S. Elcano",
                CertificateNumber = "1RTG-2023-00994",
                Validity = new DateOnly(2028, 11, 30)
            }
        };

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            ApplicationId = applicationId,
            OrNo = "OR-2026-0077812",
            OrDate = new DateOnly(2026, 7, 21),
            Amount = 5600.00m,
            CollectingOfficer = "M. Villaester"
        };

        var declaration = new Declaration
        {
            SignatoryName = "Capt. Fernando A. Magallanes",
            DateAccomplished = new DateOnly(2026, 7, 21)
        };

        return new Ntc104Application
        {
            ApplicationId = applicationId,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = TypeOfApplication.New,
            NoOfYears = 3,
            TypeOfPermitLicenseCert = TypeOfPermitLicenseCert104.ShipStationLicense,
            VesselCategory = VesselCategory.Ship,
            TradingRoute = TradingRoute.Domestic,
            Applicant = applicant,
            ShipDetails = shipDetails,
            Equipment = equipment,
            Operators = operators,
            Payment = payment,
            Declaration = declaration
        };
    }

    public static Ntc105Application GetNtc105Application()
    {
        var applicationId = Guid.NewGuid();

        var equipment = new List<Equipment>
        {
            new Equipment { RadioEquipment = "VHF Marine Transceiver", Make = "Icom", TypeModel = "IC-M330", SerialNumber = "M330-88102", PowerOutput = "25W" },
            new Equipment { RadioEquipment = "VHF Marine Transceiver", Make = "Icom", TypeModel = "IC-M330", SerialNumber = "M330-88103", PowerOutput = "25W" },
            new Equipment { RadioEquipment = "VHF Handheld Transceiver", Make = "Uniden", TypeModel = "MHS126", SerialNumber = "UNI-126-0041", PowerOutput = "6W" },
            new Equipment { RadioEquipment = "VHF Handheld Transceiver", Make = "Uniden", TypeModel = "MHS126", SerialNumber = "UNI-126-0042", PowerOutput = "6W" },
            new Equipment { RadioEquipment = "AIS Class B Transponder", Make = "Garmin", TypeModel = "AIS 800", SerialNumber = "GAR-800-9941", PowerOutput = "5W" },
            new Equipment { RadioEquipment = "Marine Radar", Make = "Furuno", TypeModel = "1815", SerialNumber = "FUR-1815-3312", PowerOutput = "4kW" }
        };

        var declaration = new Declaration
        {
            SignatoryName = "Capt. Fernando A. Magallanes",
            DateAccomplished = new DateOnly(2026, 7, 21)
        };

        return new Ntc105Application
        {
            ApplicationId = applicationId,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2025, 3, 31),
            ApplicantName = "Supercat Fast Ferry Corporation",
            Equipment = equipment,
            Declaration = declaration
        };
    }
}
