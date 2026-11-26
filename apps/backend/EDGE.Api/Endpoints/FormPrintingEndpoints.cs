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
        var group = app.MapGroup("/api/forms/demo")
            .RequireRateLimiting(EDGE.Api.Services.RateLimitPolicies.HeavyCompute)
            .WithTags("FormPrintingDemo");

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

        /// <summary>GET /api/forms/demo/ntc-1-21 — Application Form 1-21 (Duplicate / Certified True Copy).</summary>
        group.MapGet("/ntc-1-21", (IFormPrintingService printingService) =>
        {
            var application = new Ntc121Application
            {
                ApplicationId = System.Guid.NewGuid(),
                ApplicantPerson = new ApplicantPerson
                {
                    FirstName = "Juan",
                    MiddleName = "D.",
                    LastName = "Dela Cruz",
                    Address = new Address { Street = "123 Main St", CityMunicipality = "Quezon City", Province = "Metro Manila", ZipCode = "1100" },
                    ContactNumber = "09171234567",
                    Email = "juan.delacruz@example.com"
                },
                PermitLicenseCertType = "Commercial Radio Operator Certificate",
                PermitLicenseCertNo = "ROC-2026-00142",
                PermitLicenseCertValidity = new System.DateOnly(2029, 7, 20),
                CircumstancesOfLossMutilation = "Misplaced original certificate during office relocation.",
                Declaration = new Declaration { SignatoryName = "Juan D. Dela Cruz", DateAccomplished = new System.DateOnly(2026, 7, 20) }
            };
            var pdfBytes = printingService.PrintNtc121(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-21_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc121Demo");

        /// <summary>GET /api/forms/demo/ntc-1-22 — Application Form 1-22 (TVRO / CATV Station License / Registration).</summary>
        group.MapGet("/ntc-1-22", (IFormPrintingService printingService) =>
        {
            var application = new Ntc122Application
            {
                ApplicationId = System.Guid.NewGuid(),
                TypeOfApplication = TypeOfApplication.New,
                TypeOfLicenseCert = TypeOfLicenseCert122.TvroRegistrationCert,
                ClassificationOfApplicant = ClassificationOfApplicant122.CommercialBroadcasting,
                NoOfYears = 3,
                Applicant = new Applicant
                {
                    Name = "Skyline Cable & Satellite Network Corp.",
                    TypeOfEntity = EntityType.Corporation,
                    Address = new Address { Street = "88 Shaw Blvd", CityMunicipality = "Mandaluyong City", Province = "Metro Manila", ZipCode = "1550" },
                    ContactNumber = "+63 2 8555 0100",
                    Email = "regulatory@skylinecable.ph"
                },
                PaCaNo = "PA-2025-00881",
                Validity = new System.DateOnly(2029, 7, 20),
                ServiceArea = "Metro Manila",
                ProposedStation = new Station { ExactLocation = "Mandaluyong Head-End Facility", Longitude = "121 02 45 E", Latitude = "14 34 50 N" },
                Equipment = new TvroEquipmentDetails { MakeTypeModel = "Harmonic ProView IRD 8100", SerialNumber = "HRM-8100-991", FrequencyRange = "3.7 - 4.2 GHz" },
                AntennaSystem = new AntennaSystemDetails { DishDiameter = "3.8m Parabolic", Polarization = "Linear H/V", Azimuth = "142.5 deg" },
                SignalToBeReceived = new SignalToBeReceivedDetails { Satellite = "Measat-3a", Polarization = "Horizontal", ReceivedFrequency = "3840 MHz", NameOfPrograms = "News & Educational Feed" },
                Declaration = new Declaration { SignatoryName = "Engr. Marco V. Santos", DateAccomplished = new System.DateOnly(2026, 7, 20) }
            };
            var pdfBytes = printingService.PrintNtc122(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-22_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc122Demo");

        /// <summary>GET /api/forms/demo/ntc-1-24 — Application Form 1-24 (Affidavit of Ownership & Loss - Blocking/Unblocking).</summary>
        group.MapGet("/ntc-1-24", (IFormPrintingService printingService) =>
        {
            var application = new Ntc124Application
            {
                ApplicationId = System.Guid.NewGuid(),
                ActionRequested = ActionRequested124.Block,
                AffiantName = "JUAN DELA CRUZ",
                Age = 30,
                Citizenship = "Filipino",
                ResidentialAddress = new Address { Street = "123 Main St, Quezon City" },
                TelephoneNumber = "09171234567",
                ImeiNo = "351234567890123",
                MakeModelType = "Apple iPhone 15 Pro",
                SimMobileNumber = "09171234567",
                ProofOfOwnership = new ProofOfOwnershipSelection { CopyGovernmentId = true, BoxWithImei = true },
                Incident = new IncidentDetails
                {
                    IncidentType = IncidentType124.LostMisplaced,
                    Sex = Sex.Male,
                    AgeGroup = AgeGroup124.Age30_39,
                    PlaceOfIncident = "Quezon City",
                    DateOfIncident = new System.DateOnly(2026, 7, 15)
                },
                Declaration = new Declaration { SignatoryName = "JUAN DELA CRUZ", DateAccomplished = new System.DateOnly(2026, 7, 20) }
            };
            var pdfBytes = printingService.PrintNtc124(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-24_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc124Demo");

        /// <summary>GET /api/forms/demo/ntc-1-25 — Application Form 1-25 (Consumer Complaint Form).</summary>
        group.MapGet("/ntc-1-25", (IFormPrintingService printingService) =>
        {
            var application = new Ntc125Application
            {
                ApplicationId = System.Guid.NewGuid(),
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
                    BusinessAddress = "The Globe Tower, BGC, Taguig",
                    ContactNumber = "211"
                },
                NatureOfComplaint = new NatureOfComplaintDetails
                {
                    ComplaintTypes = new System.Collections.Generic.List<string> { "Spam", "Scam" },
                    DateOfIncident = new System.DateOnly(2026, 7, 18),
                    TimeOfIncident = "14:30"
                },
                StateBrieflyDetails = "Received persistent fraudulent SMS messages.",
                Declaration = new Declaration { SignatoryName = "MARIA SANTOS", DateAccomplished = new System.DateOnly(2026, 7, 20) }
            };
            var pdfBytes = printingService.PrintNtc125(application);
            return Results.File(pdfBytes, "application/pdf", $"NTC-1-25_{application.ApplicationId}.pdf");
        })
        .WithName("PrintNtc125Demo");

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



