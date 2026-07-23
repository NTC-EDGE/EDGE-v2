using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.MockData;

/// <summary>
/// Stand-in for the real API/DB layer. Swap the body of GetConstructionPermitApplication
/// for an actual repository/service call once ApplicationService -> Service.Contract ->
/// FormSubmission is wired up (see NTC_Full_ERD_Documentation.md sections 2 & 4). The
/// shape returned here matches exactly what that call should eventually return, so
/// FormDocument / ConstructionPermitReport never need to change.
/// </summary>
public static class MockDataFactory
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
            ClassOfStation = new ClassOfStation { Other = "Marine Mobile" },
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
}
