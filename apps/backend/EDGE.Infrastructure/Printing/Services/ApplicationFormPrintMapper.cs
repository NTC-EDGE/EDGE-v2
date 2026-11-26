using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

/// <summary>
/// Maps database Application entities (with FormFieldValues, ApplicantDetail, CompanyDetail, User,
/// StatementsOfAccount, and OrdersOfPayment) to all 13 official printable NTC Application Form models
/// (plus NTC 1-14 Temporary Permit to Propagate/Demonstrate).
/// </summary>
public static class ApplicationFormPrintMapper
{
    public static string ResolveCanonicalFormCode(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var service = applicant?.Service
            ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var variant = applicant?.ServiceVariant
            ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var sId = service?.Id ?? applicant?.ServiceId ?? Guid.Empty;
        var sCode = (service?.Code ?? string.Empty).Trim().ToUpperInvariant().Replace("-", "_");
        var sName = (service?.Name ?? string.Empty).Trim().ToUpperInvariant();
        var cName = (service?.ServiceCategory?.Name ?? service?.Group ?? string.Empty).Trim().ToUpperInvariant();
        var vDesc = (variant?.Description ?? variant?.Type.ToString() ?? string.Empty).Trim().ToUpperInvariant();

        var fieldValues = GetApplicantFieldValues(app, applicant);

        // 1. Direct Service Code checks
        if (sCode == "NTC_1_14")
            return "NTC_1_14";

        if (sCode is "NTC_1_01" or "EXAM_RTG" or "EXAM_RTP" or "EXAM_AMA" or "EXAM_RROC_AC" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000001"))
            return "NTC_1_01";

        if (sCode == "NTC_1_02" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000002"))
            return "NTC_1_02";

        if (sCode is "NTC_1_03" or "NTC_AMA_LICENSES" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000003") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000070") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000011"))
            return "NTC_1_03";

        if (sCode is "NTC_1_04" or "NTC_MAR_LICENSES" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000072") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000013"))
            return "NTC_1_04";

        if (sCode is "NTC_1_09" or "NTC_AERO_PERMITS" or "NTC_MAR_PERMITS" or "NTC_FLM_PERMITS" or "NTC_PTE_PERMITS" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000009") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000060") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000061") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000062") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000063"))
            return "NTC_1_09";

        if (sCode is "NTC_1_11" or "NTC_FLM_LICENSES" or "NTC_AERO_LICENSES" or "NTC_OTHER_LICENSES" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000073") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000071") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000074") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000012") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000014") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000015"))
            return "NTC_1_11";

        if (sCode is "NTC_1_18" or "NTC_EQUIP_PERMITS" or "NTC_MP_PERMITS" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000018") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000064") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000065"))
            return "NTC_1_18";

        if (sCode == "NTC_1_19" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000019"))
            return "NTC_1_19";

        if (sCode == "NTC_1_20" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000020"))
            return "NTC_1_20";

        if (sCode is "NTC_1_21" or "NTC_COPY_PERMITS" or "NTC_COPY_LICENSES" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000021") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000066") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000076") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000017"))
            return "NTC_1_21";

        if (sCode is "NTC_1_22" or "NTC_TVRO_CATV_LICENSES" or "NTC_TVRO_LICENSES" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000022") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000075") ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000016"))
            return "NTC_1_22";

        if (sCode == "NTC_1_24" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000081"))
            return "NTC_1_24";

        if (sCode == "NTC_1_25" ||
            sId == Guid.Parse("50000000-0000-0000-0000-000000000080"))
            return "NTC_1_25";

        if (sCode == "NTC_REQ_COMPLAINTS")
            return IsBlockingOrUnblocking(app, applicantId) ? "NTC_1_24" : "NTC_1_25";

        // 2. Keyword & Category heuristics
        var allText = $"{sCode} {sName} {cName} {vDesc}";

        if (allText.Contains("BLOCKING") || allText.Contains("UNBLOCKING") || IsBlockingOrUnblocking(app, applicantId))
            return "NTC_1_24";

        if (allText.Contains("COMPLAINT") || allText.Contains("TAPE PRESERVATION") || allText.Contains("SPAM") || allText.Contains("SCAM") ||
            fieldValues.Any(f => MatchesKey(f, "provider_business_name", "complaint_types", "state_briefly_details")))
            return "NTC_1_25";

        if (allText.Contains("CERTIFIED TRUE COPY") || allText.Contains("DUPLICATE COPY") ||
            allText.Contains("COPY OF CERTIFICATES") || allText.Contains("COPY OF LICENSES") || allText.Contains("COPY OF PERMITS") ||
            fieldValues.Any(f => MatchesKey(f, "circumstances", "noOfCopies", "targetCertificateNumber")))
            return "NTC_1_21";

        if (allText.Contains("TVRO") || allText.Contains("CATV") ||
            fieldValues.Any(f => MatchesKey(f, "tvroEquipment", "tvroAntenna", "tvroSignal")))
            return "NTC_1_22";

        if (allText.Contains("RFID") || allText.Contains("SRD") || allText.Contains("WDN") ||
            fieldValues.Any(f => MatchesKey(f, "devicesDetails", "Registered Devices Details")))
            return "NTC_1_19";

        if (allText.Contains("VALUE-ADDED") || allText.Contains("VALUE ADDED") || allText.Contains("(VAS)") ||
            fieldValues.Any(f => MatchesKey(f, "corVasNo", "valueAddedServices")))
            return "NTC_1_20";

        if (allText.Contains("CPE") || allText.Contains("ACCREDITATION") ||
            allText.Contains("MOBILE PHONE") || allText.Contains("DEALER PERMIT") ||
            allText.Contains("MANUFACTURER PERMIT") || allText.Contains("SERVICE CENTER PERMIT") ||
            allText.Contains("RETAILER/RESELLER") || allText.Contains("PERMIT TO TRANSPORT") ||
            fieldValues.Any(f => MatchesKey(f, "supervisingEngineer", "certificateEctNo", "technicianCertNo")))
            return "NTC_1_18";

        if (allText.Contains("SHIP STATION") || allText.Contains("SHIP EARTH") ||
            allText.Contains("COASTAL STATION") || (allText.Contains("MARITIME") && !allText.Contains("PERMIT")) ||
            fieldValues.Any(f => MatchesKey(f, "vesselName", "imoNumber", "radioOfficers")))
            return "NTC_1_04";

        if (allText.Contains("EXAMINATION") || allText.Contains("ADMISSION SLIP") || cName.Contains("EXAM") ||
            fieldValues.Any(f => MatchesKey(f, "examCategory", "examineeType", "schoolName", "courseDegree")))
            return "NTC_1_01";

        if (allText.Contains("EXCLUDING AMATEUR") || allText.Contains("COMMERCIAL RADIO OPERATOR") ||
            allText.Contains("GOVERNMENT RADIO OPERATOR") || allText.Contains("FOREIGN PILOT") ||
            allText.Contains("SPECIAL RADIO OPERATOR") || allText.Contains("1RTG") || allText.Contains("1PHN") ||
            fieldValues.Any(f => MatchesKey(f, "weight_kg", "height_cm", "employmentStatus", "typeOfCertificate")))
            return "NTC_1_02";

        if ((allText.Contains("AMATEUR") && !allText.Contains("PERMIT TO PURCHASE") && !allText.Contains("PERMIT TO POSSESS") && !allText.Contains("PERMIT TO SELL") && !cName.Contains("PERMIT")) ||
            fieldValues.Any(f => MatchesKey(f, "classOfAmateur", "clubName", "trusteeName")))
            return "NTC_1_03";

        if (allText.Contains("DEMONSTRATE") && allText.Contains("PROPAGATE"))
            return "NTC_1_14";

        if (cName.Contains("PERMIT") || allText.Contains("PERMIT TO PURCHASE") || allText.Contains("PERMIT TO POSSESS") ||
            allText.Contains("PERMIT TO SELL") || allText.Contains("VANITY CALL SIGN") ||
            fieldValues.Any(f => MatchesKey(f, "dealerName", "intendedUseType", "preferredCallSign")))
            return "NTC_1_09";

        if (cName.Contains("LICENSE") || allText.Contains("RADIO STATION LICENSE") || allText.Contains("CONSTRUCTION PERMIT"))
            return "NTC_1_11";

        return "NTC_1_11";
    }

    public static (byte[] PdfBytes, string FileName, string FormCode) PrintApplicationForm(
        EDGE.Domain.Entities.Application app,
        IFormPrintingService printingService,
        Guid? applicantId = null)
    {
        var formCode = ResolveCanonicalFormCode(app, applicantId);
        var refCode = (app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString()).Replace(" ", "_");

        switch (formCode)
        {
            case "NTC_1_01":
            {
                var model = MapToNtc101(app, applicantId);
                return (printingService.PrintNtc101(model), $"NTC_1-01_Exam_Application_{refCode}.pdf", formCode);
            }
            case "NTC_1_02":
            {
                var model = MapToNtc102(app, applicantId);
                return (printingService.PrintNtc102(model), $"NTC_1-02_Operator_Certificate_{refCode}.pdf", formCode);
            }
            case "NTC_1_03":
            {
                var model = MapToNtc103(app, applicantId);
                return (printingService.PrintNtc103(model), $"NTC_1-03_Amateur_Service_{refCode}.pdf", formCode);
            }
            case "NTC_1_04":
            {
                var model = MapToNtc104(app, applicantId);
                return (printingService.PrintNtc104(model), $"NTC_1-04_Maritime_Station_{refCode}.pdf", formCode);
            }
            case "NTC_1_09":
            {
                var model = MapToNtc109(app, applicantId);
                return (printingService.PrintPurchasePossessSellTransfer(model), $"NTC_1-09_Radio_Permit_{refCode}.pdf", formCode);
            }
            case "NTC_1_11":
            {
                var model = MapToNtc111(app, applicantId);
                return (printingService.PrintConstructionPermit(model), $"NTC_1-11_Station_License_{refCode}.pdf", formCode);
            }
            case "NTC_1_14":
            {
                var model = MapToNtc114(app, applicantId);
                return (printingService.PrintNtc114(model), $"NTC_1-14_Demo_Permit_{refCode}.pdf", formCode);
            }
            case "NTC_1_18":
            {
                var model = MapToNtc118(app, applicantId);
                return (printingService.PrintNtc118(model), $"NTC_1-18_Accreditation_Permit_{refCode}.pdf", formCode);
            }
            case "NTC_1_19":
            {
                var model = MapToNtc119(app, applicantId);
                return (printingService.PrintCertificateOfRegistration(model), $"NTC_1-19_Device_Registration_{refCode}.pdf", formCode);
            }
            case "NTC_1_20":
            {
                var model = MapToNtc120(app, applicantId);
                return (printingService.PrintNtc120(model), $"NTC_1-20_VAS_Registration_{refCode}.pdf", formCode);
            }
            case "NTC_1_21":
            {
                var model = MapToNtc121(app, applicantId);
                return (printingService.PrintNtc121(model), $"NTC_1-21_Duplicate_Copy_{refCode}.pdf", formCode);
            }
            case "NTC_1_22":
            {
                var model = MapToNtc122(app, applicantId);
                return (printingService.PrintNtc122(model), $"NTC_1-22_TVRO_CATV_{refCode}.pdf", formCode);
            }
            case "NTC_1_24":
            {
                var model = MapToNtc124(app, applicantId);
                return (printingService.PrintNtc124(model), $"NTC_1-24_Affidavit_{refCode}.pdf", formCode);
            }
            case "NTC_1_25":
            default:
            {
                var model = MapToNtc125(app, applicantId);
                return (printingService.PrintNtc125(model), $"NTC_1-25_Complaint_{refCode}.pdf", "NTC_1_25");
            }
        }
    }

    public static bool IsRequestOrComplaint(EDGE.Domain.Entities.Application app)
    {
        var primaryService = app.ApplicationApplicants?.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);
        var primaryVariant = app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);

        var sCode = (primaryService?.Code ?? string.Empty).ToUpperInvariant();
        var sName = (primaryService?.Name ?? string.Empty).ToUpperInvariant();
        var cName = (primaryService?.ServiceCategory?.Name ?? primaryService?.Group ?? string.Empty).ToUpperInvariant();
        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();

        if (sCode.Contains("NTC_1_24") || sCode.Contains("NTC_1_25") || sCode.Contains("NTC_REQ_COMPLAINTS"))
            return true;

        if (cName.Contains("REQUEST") || cName.Contains("COMPLAINT") || sName.Contains("REQUEST") || sName.Contains("COMPLAINT"))
            return true;

        if (vDesc.Contains("BLOCKING") || vDesc.Contains("UNBLOCKING") || vDesc.Contains("SPAM") || vDesc.Contains("SCAM") || vDesc.Contains("TAPE PRESERVATION"))
            return true;

        var allFieldValues = app.FormSubmissions?.SelectMany(fs => fs.FieldValues).ToList() ?? new List<FormFieldValue>();
        return allFieldValues.Any(f => MatchesKey(f, "action_requested", "device_particulars", "sim_mobile_numbers", "provider_business_name", "complaint_types", "state_briefly_details"));
    }

    public static bool IsBlockingOrUnblocking(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var primaryVariant = applicant?.ServiceVariant
            ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var primaryService = applicant?.Service
            ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.Service).FirstOrDefault(s => s != null);

        var sCode = (primaryService?.Code ?? string.Empty).ToUpperInvariant();
        if (sCode.Contains("NTC_1_24"))
            return true;

        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();
        if (vDesc.Contains("BLOCKING") || vDesc.Contains("UNBLOCKING"))
            return true;

        var allFieldValues = GetApplicantFieldValues(app, applicant);
        var actionReq = FindFieldValue(allFieldValues, "action_requested", "action requested");
        if (!string.IsNullOrWhiteSpace(actionReq))
            return true;

        var devPart = FindFieldValue(allFieldValues, "device_particulars", "device particulars");
        var simPart = FindFieldValue(allFieldValues, "sim_mobile_numbers", "sim mobile");
        return !string.IsNullOrWhiteSpace(devPart) || !string.IsNullOrWhiteSpace(simPart);
    }

    // =========================================================================
    // 1. NTC 1-01 — Application for Radio Operator Examination
    // =========================================================================
    public static Ntc101Application MapToNtc101(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var person = BuildApplicantPerson(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();

        var school = FindFieldValue(fields, "schoolName", "school / university", "school attended", "education");
        if (!string.IsNullOrWhiteSpace(school)) person.SchoolAttended = school;

        var course = FindFieldValue(fields, "courseDegree", "course / degree", "course taken");
        if (!string.IsNullOrWhiteSpace(course)) person.CourseTaken = course;

        var yrGrad = FindFieldValue(fields, "yearGraduated", "year graduated");
        if (!string.IsNullOrWhiteSpace(yrGrad) && int.TryParse(yrGrad.Trim(), out var parsedYr))
            person.YearGraduated = parsedYr;

        var elementsText = FindFieldValue(fields, "elements", "selected exam elements", "examCategory", "exam category") ?? vDesc;
        var examCode = ResolveExamCode(elementsText, vDesc);

        var examDateStr = FindFieldValue(fields, "examDate", "date of exam", "schedule");
        var examDate = TryParseDateOnly(examDateStr) ?? DateOnly.FromDateTime(app.CreatedAt.AddDays(14));

        var specialNeeds = FindFieldValue(fields, "specialNeeds", "special assistance", "assistance");
        var fullName = $"{person.FirstName} {person.MiddleName} {person.LastName}".Replace("  ", " ").Trim();
        if (string.IsNullOrWhiteSpace(fullName)) fullName = ResolveDisplayName(app, applicant, fields);

        return new Ntc101Application
        {
            ApplicationId = app.Id,
            RevisionNo = "03",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ExamCode = examCode,
            DateOfExam = examDate,
            ApplicantPerson = person,
            AssistanceRequest = new AssistanceRequest
            {
                NeedsAssistance = !string.IsNullOrWhiteSpace(specialNeeds) && !specialNeeds.Equals("No", StringComparison.OrdinalIgnoreCase) && !specialNeeds.Equals("None", StringComparison.OrdinalIgnoreCase),
                Details = specialNeeds
            },
            AdmissionSlip = new AdmissionSlip
            {
                ExamineeName = fullName,
                MailingAddressLine1 = person.Address.ToSingleLine(),
                ExaminationFor = !string.IsNullOrWhiteSpace(variant?.Description) ? variant.Description : "Radio Operator Examination",
                PlaceOfExam = !string.IsNullOrWhiteSpace(app.Office) ? app.Office : "NTC Regional Examination Center",
                DateOfExam = examDate,
                TimeOfExam = "08:00 AM - 12:00 PM"
            },
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, fullName)
        };
    }

    // =========================================================================
    // 2. NTC 1-02 — Application for Commercial Radio Operator Certificate
    // =========================================================================
    public static Ntc102Application MapToNtc102(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var basePerson = BuildApplicantPerson(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();

        var person102 = new ApplicantPerson102
        {
            FirstName = basePerson.FirstName,
            MiddleName = basePerson.MiddleName,
            LastName = basePerson.LastName,
            DateOfBirth = basePerson.DateOfBirth,
            Sex = basePerson.Sex,
            Nationality = basePerson.Nationality,
            Address = basePerson.Address,
            ContactNumber = basePerson.ContactNumber,
            Email = basePerson.Email,
            HeightCm = applicant?.ApplicantDetail?.Height,
            WeightKg = applicant?.ApplicantDetail?.Weight
        };

        var heightVal = FindFieldValue(fields, "height_cm", "height");
        if (!string.IsNullOrWhiteSpace(heightVal) && double.TryParse(heightVal, out var h))
            person102.HeightCm = h;

        var weightVal = FindFieldValue(fields, "weight_kg", "weight");
        if (!string.IsNullOrWhiteSpace(weightVal) && double.TryParse(weightVal, out var w))
            person102.WeightKg = w;

        var empStatus = FindFieldValue(fields, "employmentStatus", "employment status") ?? "";
        var empType = FindFieldValue(fields, "employmentType", "employmentLocation") ?? "";
        if (empStatus.Contains("Employed", StringComparison.OrdinalIgnoreCase) && !empStatus.Contains("Unemployed", StringComparison.OrdinalIgnoreCase))
        {
            person102.EmploymentStatus = empType.Contains("Foreign", StringComparison.OrdinalIgnoreCase)
                ? EmploymentStatus.EmployedForeign
                : EmploymentStatus.EmployedLocal;
        }
        else
        {
            person102.EmploymentStatus = EmploymentStatus.Unemployed;
        }

        var certTypeStr = FindFieldValue(fields, "typeOfCertificate", "type of certificate", "elements") ?? vDesc;
        var (certType, otherDetails) = ResolveCertificateType102(certTypeStr, vDesc);

        var fullName = $"{person102.FirstName} {person102.MiddleName} {person102.LastName}".Replace("  ", " ").Trim();
        if (string.IsNullOrWhiteSpace(fullName)) fullName = ResolveDisplayName(app, applicant, fields);

        return new Ntc102Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ModificationReason = FindFieldValue(fields, "modificationDueTo", "modification reason"),
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            TypeOfCertificate = certType,
            OtherCertificateDetails = otherDetails,
            ApplicantPerson = person102,
            ExamSeminarDetails = new ExamSeminarDetails
            {
                PlaceOfExamSeminar = FindFieldValue(fields, "examSeminarAddress", "placeOfExamSeminar", "seminar / exam address", "place of exam") ?? "",
                Date = TryParseDateOnly(FindFieldValue(fields, "examSeminarDate", "dateOfExamSeminar", "exam date")) ?? DateOnly.FromDateTime(app.CreatedAt),
                Rating = FindFieldValue(fields, "examSeminarRating", "ratings", "rating") ?? ""
            },
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, fullName)
        };
    }

    // =========================================================================
    // 3. NTC 1-03 — Application for Amateur Radio Operator Certificate / License
    // =========================================================================
    public static Ntc103Application MapToNtc103(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var person = BuildApplicantPerson(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();

        var permitTypeStr = FindFieldValue(fields, "permitType", "permit / license type") ?? vDesc;
        var permitType = TypeOfPermitLicenseCert103.AmateurRadioOperatorCertificate;
        if (permitTypeStr.Contains("CLUB", StringComparison.OrdinalIgnoreCase) || vDesc.Contains("CLUB"))
            permitType = TypeOfPermitLicenseCert103.ClubRadioStationLicense;
        else if (permitTypeStr.Contains("FOREIGN", StringComparison.OrdinalIgnoreCase) || permitTypeStr.Contains("TEMPORARY", StringComparison.OrdinalIgnoreCase))
            permitType = TypeOfPermitLicenseCert103.TemporaryPermitForeignVisitor;
        else if (permitTypeStr.Contains("VANITY", StringComparison.OrdinalIgnoreCase) || permitTypeStr.Contains("SPECIAL", StringComparison.OrdinalIgnoreCase))
            permitType = TypeOfPermitLicenseCert103.SpecialPermitVanityCallSign;
        else if (permitTypeStr.Contains("STATION LICENSE", StringComparison.OrdinalIgnoreCase) || vDesc.Contains("STATION LICENSE"))
            permitType = TypeOfPermitLicenseCert103.AmateurRadioStationLicense;

        var classStr = FindFieldValue(fields, "classOfAmateur", "classOfStation", "class of station", "class of amateur") ?? vDesc;
        var stationClass = ClassOfStationAmateur.ClassA;
        if (classStr.Contains("CLASS D", StringComparison.OrdinalIgnoreCase)) stationClass = ClassOfStationAmateur.ClassD;
        else if (classStr.Contains("CLASS C", StringComparison.OrdinalIgnoreCase)) stationClass = ClassOfStationAmateur.ClassC;
        else if (classStr.Contains("CLASS B", StringComparison.OrdinalIgnoreCase)) stationClass = ClassOfStationAmateur.ClassB;

        var fullName = $"{person.FirstName} {person.MiddleName} {person.LastName}".Replace("  ", " ").Trim();
        if (string.IsNullOrWhiteSpace(fullName)) fullName = ResolveDisplayName(app, applicant, fields);

        return new Ntc103Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ModificationReason = FindFieldValue(fields, "modificationDueTo", "modification due to"),
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            TypeOfPermitLicenseCert = permitType,
            ClassOfStation = stationClass,
            NameOfClub = FindFieldValue(fields, "clubName", "clubDetails", "club name", "amateur club"),
            AssignedFreq = FindFieldValue(fields, "frequencyBands", "frequency", "assigned freq"),
            PreferredCallSigns = FindFieldValue(fields, "preferredCallSign", "preferred call sign"),
            ApplicantPerson = person,
            CallSign = FindFieldValue(fields, "callSign", "call sign", "trusteeCallSign") ?? "",
            AtrocArslNo = FindFieldValue(fields, "licenseNo", "existing license no", "trusteeLicenseNo", "amateurLicenseNo") ?? "",
            Validity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "license expiry date", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(3)),
            ExamSeminarDetails = new ExamSeminarDetails
            {
                PlaceOfExamSeminar = FindFieldValue(fields, "examSeminarAddress", "placeOfExamSeminar", "seminar / exam address", "place of exam") ?? "",
                Date = TryParseDateOnly(FindFieldValue(fields, "examSeminarDate", "dateOfExamSeminar")) ?? DateOnly.FromDateTime(app.CreatedAt),
                Rating = FindFieldValue(fields, "examSeminarRating", "ratings", "rating") ?? ""
            },
            Equipment = ExtractEquipmentList(app.Id, fields),
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, fullName)
        };
    }

    // =========================================================================
    // 4. NTC 1-04 — Application for Maritime / Ship Radio Station License
    // =========================================================================
    public static Ntc104Application MapToNtc104(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();

        var certType = TypeOfPermitLicenseCert104.ShipStationLicense;
        if (vDesc.Contains("SHIP EARTH")) certType = TypeOfPermitLicenseCert104.ShipEarthStationLicense;
        else if (vDesc.Contains("SAFETY RADIO")) certType = TypeOfPermitLicenseCert104.CargoShipSafetyRadioCertificate;
        else if (vDesc.Contains("FERRYING")) certType = TypeOfPermitLicenseCert104.FerryingPermit;
        else if (vDesc.Contains("TEMPORARY")) certType = TypeOfPermitLicenseCert104.TemporaryPermit;

        var route = vDesc.Contains("INTERNATIONAL") ? TradingRoute.International : TradingRoute.Domestic;

        var operators = ExtractRadioOperators(fields);

        return new Ntc104Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ModificationReason = FindFieldValue(fields, "modificationDueTo", "modification reason"),
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            TypeOfPermitLicenseCert = certType,
            VesselCategory = VesselCategory.Ship,
            TradingRoute = route,
            Applicant = orgApplicant,
            ShipDetails = new ShipDetails
            {
                NameOfShipVessel = FindFieldValue(fields, "vesselName", "vessel name") ?? orgApplicant.Name,
                CallSign = FindFieldValue(fields, "callSign", "call sign") ?? "",
                MmsiNo = FindFieldValue(fields, "mmsi", "mmsiNo") ?? "",
                StationLicenseNo = FindFieldValue(fields, "stationLicenseNo", "station license no") ?? "",
                ImoNo = FindFieldValue(fields, "imoNumber", "imo number", "gross tonnage") ?? "",
                Validity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(3))
            },
            Equipment = ExtractEquipmentList(app.Id, fields),
            Operators = operators,
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 5. NTC 1-09 — Permit to Purchase / Possess / Storage / Sell / Transfer
    // =========================================================================
    public static PurchasePossessSellTransferApplication MapToNtc109(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var service = applicant?.Service;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();
        var sCode = (service?.Code ?? string.Empty).ToUpperInvariant();
        var sName = (service?.Name ?? string.Empty).ToUpperInvariant();

        var specificType = TypeOfApplicationSpecific.Purchase;
        if (vDesc.Contains("STORAGE")) specificType = TypeOfApplicationSpecific.PossessForStorage;
        else if (vDesc.Contains("SELL") || vDesc.Contains("TRANSFER")) specificType = TypeOfApplicationSpecific.SellTransfer;
        else if (vDesc.Contains("POSSESS") && !vDesc.Contains("PURCHASE")) specificType = TypeOfApplicationSpecific.Possess;

        var radioService = TypeOfRadioService.FixedAndLandMobile;
        if (sCode.Contains("AMA") || sName.Contains("AMATEUR") || vDesc.Contains("AMATEUR")) radioService = TypeOfRadioService.Amateur;
        else if (sCode.Contains("AERO") || sName.Contains("AERONAUTICAL") || vDesc.Contains("AERONAUTICAL") || vDesc.Contains("AIRCRAFT")) radioService = TypeOfRadioService.Aeronautical;
        else if (sCode.Contains("MAR") || sName.Contains("MARITIME") || vDesc.Contains("SHIP") || vDesc.Contains("COASTAL")) radioService = TypeOfRadioService.MaritimePublicPrivateCoastal;

        var natureStr = FindFieldValue(fields, "natureOfService", "nature of service") ?? vDesc;
        var nature = NatureOfService.CvPrivate;
        if (natureStr.Contains("GOV", StringComparison.OrdinalIgnoreCase) || natureStr.Contains("CO ", StringComparison.OrdinalIgnoreCase))
            nature = NatureOfService.CoGovernment;
        else if (natureStr.Contains("PUBLIC", StringComparison.OrdinalIgnoreCase) || sCode.Contains("PTE"))
            nature = NatureOfService.CpPublicCorrespondence;

        var intendedStr = FindFieldValue(fields, "intendedUseType", "intended use") ?? "";
        var intended = IntendedUse.NewRadioStation;
        if (intendedStr.Contains("Additional Radio Equipment", StringComparison.OrdinalIgnoreCase)) intended = IntendedUse.AdditionalEquipment;
        else if (intendedStr.Contains("Change of Equipment", StringComparison.OrdinalIgnoreCase)) intended = IntendedUse.ChangeOfEquipment;
        else if (intendedStr.Contains("Storage", StringComparison.OrdinalIgnoreCase) || vDesc.Contains("STORAGE")) intended = IntendedUse.Storage;
        else if (intendedStr.Contains("Other", StringComparison.OrdinalIgnoreCase)) intended = IntendedUse.Other;

        var stations = ExtractStationsList(app.Id, fields);
        var proposedStation = stations.FirstOrDefault() ?? new Station
        {
            StationId = Guid.NewGuid(),
            ApplicationId = app.Id,
            ExactLocation = FindFieldValue(fields, "stationLocation", "exactLocation", "location") ?? orgApplicant.Address.ToSingleLine(),
            PointsOfCommServiceArea = FindFieldValue(fields, "serviceArea", "points of comm") ?? "",
            AssignedFreq = FindFieldValue(fields, "frequency", "frequency(ies)") ?? "",
            BwEmission = $"{FindFieldValue(fields, "bandwidth") ?? ""} {FindFieldValue(fields, "bandwidthUnit") ?? ""} / {FindFieldValue(fields, "emission") ?? ""}".Trim(' ', '/'),
            Configuration = FindFieldValue(fields, "configuration") ?? "",
            DataRate = FindFieldValue(fields, "dataRate", "data rate") ?? "",
            CallSign = FindFieldValue(fields, "callSign", "preferredCallSign", "call sign") ?? "",
            RslNo = FindFieldValue(fields, "permitRslNo", "amateurLicenseNoPermitNo") ?? "",
            Others = FindFieldValue(fields, "remarks", "hoursOfOperation") ?? ""
        };

        return new PurchasePossessSellTransferApplication
        {
            ApplicationId = app.Id,
            RevisionNo = "03",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            Applicant = orgApplicant,
            Equipment = ExtractEquipmentList(app.Id, fields),
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name),
            TypeOfApplicationSpecific = specificType,
            TypeOfRadioService = radioService,
            NatureOfService = nature,
            ClassOfStation = BuildClassOfStation(fields),
            CpcCpcnPaRslNo = FindFieldValue(fields, "permitRslNo", "cpcnPaCaNo", "amateurLicenseNo") ?? "",
            Validity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(1)),
            ProposedStation = proposedStation,
            SourceOfEquipment = new SourceOfEquipment
            {
                NameOfDealer = FindFieldValue(fields, "dealerName", "name of dealer") ?? "",
                SellerAddress = FindFieldValue(fields, "dealerAddress", "sellerAddress", "dealer / supplier address") ?? "",
                OrInvoiceNo = FindFieldValue(fields, "orInvoiceNo", "invoiceNumber", "or/invoice") ?? "",
                AuthorizedSellerBuyer = FindFieldValue(fields, "authorizedSellerBuyer", "authorized seller") ?? "",
                PermitRslNo = FindFieldValue(fields, "permitRslNo", "amateurLicenseNoPermitNo") ?? "",
                AmateurLicenseNo = FindFieldValue(fields, "amateurLicenseNo", "amateur license no") ?? ""
            },
            IntendedUse = intended
        };
    }

    // =========================================================================
    // 6. NTC 1-11 — Construction Permit / Radio Station License
    // =========================================================================
    public static ConstructionPermitApplication MapToNtc111(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var service = applicant?.Service;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();
        var sCode = (service?.Code ?? string.Empty).ToUpperInvariant();
        var sName = (service?.Name ?? string.Empty).ToUpperInvariant();

        var subtype = vDesc.Contains("CONSTRUCTION PERMIT")
            ? PermitSubtype.ConstructionPermit
            : PermitSubtype.RadioStationLicense;

        var radioService = TypeOfRadioService.FixedAndLandMobile;
        if (sCode.Contains("AERO") || sName.Contains("AERONAUTICAL") || vDesc.Contains("AERONAUTICAL") || vDesc.Contains("AIRCRAFT"))
            radioService = TypeOfRadioService.Aeronautical;
        else if (sCode.Contains("MAR") || vDesc.Contains("COASTAL"))
            radioService = TypeOfRadioService.MaritimePublicPrivateCoastal;

        var natureStr = FindFieldValue(fields, "natureOfService", "nature of service") ?? vDesc;
        var nature = NatureOfService.CvPrivate;
        if (natureStr.Contains("GOV", StringComparison.OrdinalIgnoreCase)) nature = NatureOfService.CoGovernment;
        else if (natureStr.Contains("PUBLIC", StringComparison.OrdinalIgnoreCase)) nature = NatureOfService.CpPublicCorrespondence;

        var stations = ExtractStationsList(app.Id, fields);
        if (stations.Count == 0)
        {
            stations.Add(new Station
            {
                StationId = Guid.NewGuid(),
                ApplicationId = app.Id,
                ExactLocation = FindFieldValue(fields, "stationLocation", "baseOfOperation", "exactLocation") ?? orgApplicant.Address.ToSingleLine(),
                PointsOfCommServiceArea = FindFieldValue(fields, "serviceArea", "points of comm") ?? "",
                AssignedFreq = FindFieldValue(fields, "frequency", "frequency(ies)") ?? "",
                BwEmission = $"{FindFieldValue(fields, "bandwidth") ?? ""} / {FindFieldValue(fields, "emission") ?? ""}".Trim(' ', '/'),
                Configuration = FindFieldValue(fields, "configuration") ?? "",
                DataRate = FindFieldValue(fields, "dataRate") ?? "",
                CallSign = FindFieldValue(fields, "callSign", "aircraftRegNo") ?? "",
                RslNo = FindFieldValue(fields, "stationLicenseNo", "permitRslNo") ?? "",
                Validity = DateOnly.FromDateTime(app.CreatedAt.AddYears(3)),
                Others = FindFieldValue(fields, "remarks", "aircraftMakeModel") ?? "",
                Antenna = BuildSingleAntenna(fields)
            });
        }

        return new ConstructionPermitApplication
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ModificationReason = FindFieldValue(fields, "modificationDueTo", "modification reason"),
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            Applicant = orgApplicant,
            Equipment = ExtractEquipmentList(app.Id, fields),
            Stations = stations,
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name),
            PermitSubtype = subtype,
            TypeOfRadioService = radioService,
            NatureOfService = nature,
            ClassOfStation = BuildClassOfStation(fields)
        };
    }

    // =========================================================================
    // 7. NTC 1-14 — Temporary Permit to Propagate / Demonstrate
    // =========================================================================
    public static Ntc114Application MapToNtc114(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var stations = ExtractStationsList(app.Id, fields);
        var equipmentList = ExtractEquipmentList(app.Id, fields);

        return new Ntc114Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            NatureOfService = NatureOfService114.CV,
            TypeOfRadioService = TypeOfRadioService114.FixedAndLandMobile,
            ClassOfStation = BuildClassOfStation(fields),
            Applicant = orgApplicant,
            ProposedStation = stations.FirstOrDefault() ?? new Station
            {
                StationId = Guid.NewGuid(),
                ApplicationId = app.Id,
                ExactLocation = FindFieldValue(fields, "stationLocation", "exactLocation") ?? orgApplicant.Address.ToSingleLine(),
                PointsOfCommServiceArea = FindFieldValue(fields, "serviceArea") ?? "",
                AssignedFreq = FindFieldValue(fields, "frequency") ?? ""
            },
            Equipment = equipmentList.FirstOrDefault() ?? new Equipment
            {
                EquipmentId = Guid.NewGuid(),
                ApplicationId = app.Id,
                Make = FindFieldValue(fields, "makeModel", "makeTypeModel") ?? "Radio Transceiver",
                SerialNumber = FindFieldValue(fields, "serialNumber") ?? "",
                PowerOutput = FindFieldValue(fields, "powerOutput") ?? "",
                FrequencyRange = FindFieldValue(fields, "frequencyRange", "frequency") ?? ""
            },
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 8. NTC 1-18 — CPE Supplier Accreditation & Dealer/Mfg/Service Center Permit
    // =========================================================================
    public static Ntc118Application MapToNtc118(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var service = applicant?.Service;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();
        var sCode = (service?.Code ?? string.Empty).ToUpperInvariant();
        var sName = (service?.Name ?? string.Empty).ToUpperInvariant();

        var cat = new PermitCategorySelection();
        if (sCode == "NTC_1_18" || sName.Contains("CUSTOMER PREMISES") || sName.Contains("CPE") || vDesc.Contains("CPE"))
        {
            cat.CpeSupplierAccreditation = true;
        }
        else if (sCode == "NTC_MP_PERMITS" || sName.Contains("MOBILE PHONE"))
        {
            cat.MobilePhoneCategory = true;
            if (vDesc.Contains("RETAILER") || vDesc.Contains("RESELLER")) cat.MpRetailerReseller = true;
            else if (vDesc.Contains("SERVICE CENTER")) cat.MpServiceCenter = true;
            else cat.MpDealer = true;
        }
        else
        {
            cat.RceCategory = true;
            if (vDesc.Contains("MANUFACTURER")) cat.RceManufacturer = true;
            else if (vDesc.Contains("SERVICE CENTER")) cat.RceServiceCenter = true;
            else
            {
                cat.RceDealer = true;
                cat.RceDealerTransceiver = true;
            }
        }

        return new Ntc118Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            ModificationReason = FindFieldValue(fields, "modificationDueTo", "modification reason"),
            PermitCategory = cat,
            Applicant = orgApplicant,
            ExistingPermitNo = FindFieldValue(fields, "permitNo", "licenseNo", "permitRslNo"),
            ExistingPermitValidity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? default,
            SupervisingEngineer = new RequiredPersonnel
            {
                Name = FindFieldValue(fields, "supervisingEngineer", "supervising engineer") ?? "",
                LicenseNo = FindFieldValue(fields, "certificateEctNo", "certificate/ect no") ?? "",
                ValidityDate = TryParseDateOnly(FindFieldValue(fields, "certificateEctExpiryDate", "ect no. date of expiry")) ?? default
            },
            Technician = new RequiredPersonnel
            {
                Name = FindFieldValue(fields, "technicianName", "technician name") ?? "",
                LicenseNo = FindFieldValue(fields, "technicianCertNo", "certificate/number") ?? "",
                ValidityDate = TryParseDateOnly(FindFieldValue(fields, "technicianExpiryDate", "certificate/number date of expiry")) ?? default
            },
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 9. NTC 1-19 — Certificate of Registration (RFID / SRD / WDN Devices)
    // =========================================================================
    public static CertificateOfRegistrationApplication MapToNtc119(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;

        var devTypeStr = FindFieldValue(fields, "deviceType", "device / equipment type") ?? "";
        var devType = EquipmentDeviceType.Rfid;
        if (devTypeStr.Contains("WDN", StringComparison.OrdinalIgnoreCase) || devTypeStr.Contains("Wireless Data", StringComparison.OrdinalIgnoreCase))
            devType = EquipmentDeviceType.WdnIndoor;
        else if (devTypeStr.Contains("SRD", StringComparison.OrdinalIgnoreCase) || devTypeStr.Contains("Short Range Device", StringComparison.OrdinalIgnoreCase))
            devType = EquipmentDeviceType.Srd;
        else if (devTypeStr.Contains("SRRS", StringComparison.OrdinalIgnoreCase))
            devType = EquipmentDeviceType.Srrs;
        else if (devTypeStr.Contains("Trunked", StringComparison.OrdinalIgnoreCase))
            devType = EquipmentDeviceType.PublicTrunkedRadioMobilePortable;

        var devices = ExtractDevices119(fields);

        return new CertificateOfRegistrationApplication
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            Applicant = orgApplicant,
            EquipmentDeviceType = devType,
            PermitToImportNo = FindFieldValue(fields, "permitRslNo", "permit to import") ?? "",
            InvoiceNo = FindFieldValue(fields, "invoiceNumber", "orInvoiceNo", "invoice number") ?? "",
            CpcnPaRslNo = FindFieldValue(fields, "cpcnPaCaNo", "dtiSecRegistration") ?? "",
            Validity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(3)),
            Devices = devices,
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 10. NTC 1-20 — Certificate of Registration (VAS / VOIP / PCSOTSP)
    // =========================================================================
    public static Ntc120Application MapToNtc120(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;

        var svcClassStr = FindFieldValue(fields, "serviceClassification", "valueAddedServices") ?? "";
        var regCat = new RegistrationCategory120
        {
            PcsotspProvider = svcClassStr.Contains("PCSOTSP", StringComparison.OrdinalIgnoreCase),
            VoipProvider = svcClassStr.Contains("VOIP", StringComparison.OrdinalIgnoreCase) && !svcClassStr.Contains("RESELLER", StringComparison.OrdinalIgnoreCase),
            VoipReseller = svcClassStr.Contains("RESELLER", StringComparison.OrdinalIgnoreCase),
            VasProvider = true
        };

        var vasStr = FindFieldValue(fields, "valueAddedServices", "value-added services") ?? "";
        var vas = new VasServicesSelection
        {
            MessagingService = vasStr.Contains("Messaging", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(vasStr),
            ContentAndProgramService = vasStr.Contains("Content", StringComparison.OrdinalIgnoreCase),
            AudioConferencing = vasStr.Contains("Audio Conferencing", StringComparison.OrdinalIgnoreCase),
            AudiotextService = vasStr.Contains("Audiotext", StringComparison.OrdinalIgnoreCase),
            AudioAndVideoConferencing = vasStr.Contains("Video", StringComparison.OrdinalIgnoreCase),
            FacsimileService = vasStr.Contains("Facsimile", StringComparison.OrdinalIgnoreCase),
            VoiceMailService = vasStr.Contains("Voice", StringComparison.OrdinalIgnoreCase),
            VirtualPrivateNetworkService = vasStr.Contains("VPN", StringComparison.OrdinalIgnoreCase) || vasStr.Contains("Virtual Private", StringComparison.OrdinalIgnoreCase),
            ElectronicMailService = vasStr.Contains("Mail", StringComparison.OrdinalIgnoreCase),
            HostingService = vasStr.Contains("Hosting", StringComparison.OrdinalIgnoreCase),
            InformationService = vasStr.Contains("Information", StringComparison.OrdinalIgnoreCase),
            ElectronicGamingServices = vasStr.Contains("Gaming", StringComparison.OrdinalIgnoreCase),
            ApplicationService = vasStr.Contains("Application", StringComparison.OrdinalIgnoreCase)
        };

        var knownOther = FindFieldValue(fields, "knownByAnotherName", "known by other name") ?? "";
        var otherTrade = FindFieldValue(fields, "otherTradeName", "please specify");

        return new Ntc120Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            RegistrationCategory = regCat,
            Applicant = orgApplicant,
            CpcnPaCaNo = FindFieldValue(fields, "cpcnPaCaNo", "cpcn / pa / ca no") ?? "",
            CpcnPaCaValidity = TryParseDateOnly(FindFieldValue(fields, "cpcnDateOfExpiry", "cpcn / pa / ca no. date of expiry")) ?? default,
            CorNo = FindFieldValue(fields, "corVasNo", "cor / vas no") ?? "",
            CorValidity = TryParseDateOnly(FindFieldValue(fields, "corVasExpiryDate", "cor / vas no. date of expiry")) ?? default,
            FormerNameInfo = new FormerNameInfo
            {
                IsKnownByFormerName = knownOther.Equals("Yes", StringComparison.OrdinalIgnoreCase) || !string.IsNullOrWhiteSpace(otherTrade),
                FormerName = otherTrade
            },
            VasServices = vas,
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 11. NTC 1-21 — Certified True Copy / Duplicate Copy
    // =========================================================================
    public static Ntc121Application MapToNtc121(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var person = BuildApplicantPerson(app, applicant, fields);
        var variant = applicant?.ServiceVariant;

        var docType = FindFieldValue(fields, "targetCertificateType", "targetPermitType", "targetService", "detailsService")
            ?? variant?.Description
            ?? applicant?.Service?.Name
            ?? "Permit / License / Certificate";

        var docNo = FindFieldValue(fields, "targetCertificateNumber", "permitNo", "permitRslNo", "licenseNo", "callSign")
            ?? app.ApplicationNumber
            ?? app.ReferenceNumber
            ?? "";

        var fullName = $"{person.FirstName} {person.MiddleName} {person.LastName}".Replace("  ", " ").Trim();
        if (string.IsNullOrWhiteSpace(fullName)) fullName = ResolveDisplayName(app, applicant, fields);

        return new Ntc121Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            ApplicantPerson = person,
            CircumstancesOfLossMutilation = FindFieldValue(fields, "circumstances", "circumstances relating to lost") ?? (variant?.Description ?? "Certified True Copy / Duplicate Request"),
            PermitLicenseCertType = docType,
            PermitLicenseCertNo = docNo,
            PermitLicenseCertValidity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(1)),
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, fullName)
        };
    }

    // =========================================================================
    // 12. NTC 1-22 — TVRO Registration Certificate / TVRO & CATV Station License
    // =========================================================================
    public static Ntc122Application MapToNtc122(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var applicant = ResolveApplicant(app, applicantId);
        var fields = GetApplicantFieldValues(app, applicant);
        var orgApplicant = BuildApplicantEntity(app, applicant, fields);
        var variant = applicant?.ServiceVariant;
        var vDesc = (variant?.Description ?? string.Empty).ToUpperInvariant();

        var licType = TypeOfLicenseCert122.TvroRegistrationCert;
        if (vDesc.Contains("CATV")) licType = TypeOfLicenseCert122.CatvStationLicense;
        else if (vDesc.Contains("STATION LICENSE")) licType = TypeOfLicenseCert122.TvroStationLicense;

        var classification = ClassificationOfApplicant122.CommercialBroadcasting;
        if (vDesc.Contains("NON-COMMERCIAL")) classification = ClassificationOfApplicant122.NonCommercial;
        else if (vDesc.Contains("CATV")) classification = ClassificationOfApplicant122.Catv;

        var tvroEq = ExtractTvroEquipment(fields);
        var tvroAnt = ExtractTvroAntenna(fields);
        var tvroSig = ExtractTvroSignal(fields);

        return new Ntc122Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31),
            TypeOfApplication = ResolveTypeOfApplication(variant, fields),
            TypeOfLicenseCert = licType,
            ClassificationOfApplicant = classification,
            NoOfYears = ResolveNoOfYears(fields, app, applicant),
            Applicant = orgApplicant,
            PaCaNo = FindFieldValue(fields, "cpcnPaCaNo", "bsdNo", "permitRslNo") ?? "",
            Validity = TryParseDateOnly(FindFieldValue(fields, "dateOfExpiry", "expiryDate")) ?? DateOnly.FromDateTime(app.CreatedAt.AddYears(3)),
            ServiceArea = FindFieldValue(fields, "serviceArea", "points of comm") ?? "",
            ProposedStation = new Station
            {
                StationId = Guid.NewGuid(),
                ApplicationId = app.Id,
                ExactLocation = FindFieldValue(fields, "exactLocation", "exact location of tvro", "stationLocation") ?? orgApplicant.Address.ToSingleLine(),
                Longitude = FindFieldValue(fields, "longitude") ?? "",
                Latitude = FindFieldValue(fields, "latitude") ?? ""
            },
            Equipment = tvroEq,
            AntennaSystem = tvroAnt,
            SignalToBeReceived = tvroSig,
            Payment = BuildPayment(app, applicant),
            Declaration = BuildDeclaration(app, orgApplicant.Name)
        };
    }

    // =========================================================================
    // 13. NTC 1-24 — Affidavit of Ownership and Loss (Blocking / Unblocking)
    // =========================================================================
    public static Ntc124Application MapToNtc124(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var model = new Ntc124Application
        {
            ApplicationId = app.Id,
            RevisionNo = "02",
            RevisionDate = new DateOnly(2023, 3, 31)
        };

        var applicant = ResolveApplicant(app, applicantId);
        var person = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;
        var allFieldValues = GetApplicantFieldValues(app, applicant);

        var fullName = person != null
            ? $"{person.FirstName} {person.LastName}".Trim()
            : (company?.Name ?? $"{app.User?.FirstName} {app.User?.LastName}".Trim());

        model.AffiantName = !string.IsNullOrWhiteSpace(fullName) ? fullName : "Affiant";
        model.Citizenship = !string.IsNullOrWhiteSpace(person?.Nationality) ? person.Nationality : "Filipino";

        if (person != null && person.BirthDate != default && person.BirthDate.Year > 1900)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - person.BirthDate.Year;
            if (person.BirthDate > today.AddYears(-age)) age--;
            model.Age = Math.Max(1, age);
        }

        var fullAddress = person?.Address ?? company?.Address ?? $"{app.User?.Unit} {app.User?.Street}".Trim();
        model.ResidentialAddress = new Address { Street = fullAddress };
        model.TelephoneNumber = person?.ContactNumber ?? company?.ContactNumber ?? app.User?.ContactNumber ?? "";

        // Action Requested
        var actionVal = FindFieldValue(allFieldValues, "action_requested", "action requested") ?? "";
        var primaryVariant = applicant?.ServiceVariant ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
        var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToUpperInvariant();

        if (actionVal.Contains("UNBLOCK", StringComparison.OrdinalIgnoreCase) || vDesc.Contains("UNBLOCKING"))
        {
            model.ActionRequested = ActionRequested124.Unblock;
        }
        else
        {
            model.ActionRequested = ActionRequested124.Block;
        }

        // Device Particulars
        ExtractDeviceParticulars(allFieldValues, model);

        // Incident Details
        var incident = model.Incident;
        var lossReason = FindFieldValue(allFieldValues, "loss_reason", "incident type", "incident", "reason", "loss") ?? "";
        if (lossReason.Contains("stolen", StringComparison.OrdinalIgnoreCase))
        {
            incident.IncidentType = IncidentType124.Stolen;
        }
        else if (lossReason.Contains("other", StringComparison.OrdinalIgnoreCase))
        {
            incident.IncidentType = IncidentType124.Others;
            incident.OthersSpecification = FindFieldValue(allFieldValues, "incident_others_specify", "others_specification", "please specify") ?? "";
        }
        else
        {
            incident.IncidentType = IncidentType124.LostMisplaced;
        }

        var filingDateVal = FindFieldValue(allFieldValues, "date_of_filing", "date of filing");
        if (!string.IsNullOrWhiteSpace(filingDateVal) && DateOnly.TryParse(filingDateVal, out var parsedFilingDate))
        {
            incident.DateOfFiling = parsedFilingDate;
        }

        var recoveryDateVal = FindFieldValue(allFieldValues, "date_of_recovery", "date of recovery");
        if (!string.IsNullOrWhiteSpace(recoveryDateVal) && DateOnly.TryParse(recoveryDateVal, out var parsedRecoveryDate))
        {
            incident.DateOfRecovery = parsedRecoveryDate;
        }

        incident.UnblockingDetails = FindFieldValue(allFieldValues, "unblocking_details", "details") ?? "";

        var sexVal = FindFieldValue(allFieldValues, "sex") ?? person?.Sex ?? app.User?.Sex ?? "";
        incident.Sex = sexVal.StartsWith("F", StringComparison.OrdinalIgnoreCase) ? Sex.Female : Sex.Male;

        var ageGroupVal = FindFieldValue(allFieldValues, "age_group", "age") ?? "";
        incident.AgeGroup = ResolveAgeGroup(ageGroupVal, model.Age);

        var timeOfDayVal = FindFieldValue(allFieldValues, "time_of_day", "time of incident") ?? "";
        incident.TimeOfDay = timeOfDayVal.Contains("night", StringComparison.OrdinalIgnoreCase)
            ? TimeOfDay124.Nighttime
            : TimeOfDay124.Daytime;

        incident.PlaceOfIncident = FindFieldValue(allFieldValues, "place_of_incident", "place") ?? "";

        var dateVal = FindFieldValue(allFieldValues, "date_of_incident", "date");
        if (!string.IsNullOrWhiteSpace(dateVal) && DateOnly.TryParse(dateVal, out var parsedDate))
        {
            incident.DateOfIncident = parsedDate;
        }
        else
        {
            incident.DateOfIncident = DateOnly.FromDateTime(app.CreatedAt);
        }

        // Proof of Ownership checkboxes
        var proofType = FindFieldValue(allFieldValues, "proof_of_ownership_type", "ownership") ?? "";
        var idType = FindFieldValue(allFieldValues, "identity_proof_type", "valid id") ?? "";

        var p = model.ProofOfOwnership;
        if (idType.Contains("school", StringComparison.OrdinalIgnoreCase)) p.CopySchoolId = true;
        else if (idType.Contains("birth", StringComparison.OrdinalIgnoreCase) || idType.Contains("nbi", StringComparison.OrdinalIgnoreCase)) p.CopyBirthCertOrNbi = true;
        else p.CopyGovernmentId = true;

        if (proofType.Contains("box", StringComparison.OrdinalIgnoreCase)) p.BoxWithImei = true;
        else if (proofType.Contains("certificate", StringComparison.OrdinalIgnoreCase)) p.CertificateOfPurchase = true;
        else if (proofType.Contains("affidavit", StringComparison.OrdinalIgnoreCase)) p.AffidavitInAbsence = true;
        else p.ProofOfOwnershipReceipt = true;

        // Declaration
        model.Declaration = BuildDeclaration(app, model.AffiantName);

        return model;
    }

    // =========================================================================
    // 14. NTC 1-25 — Consumer Complaints & Mandatory Tape Preservation
    // =========================================================================
    public static Ntc125Application MapToNtc125(EDGE.Domain.Entities.Application app, Guid? applicantId = null)
    {
        var model = new Ntc125Application
        {
            ApplicationId = app.Id,
            ApplicationNumber = app.ApplicationNumber ?? app.ReferenceNumber ?? app.Id.ToString(),
            ReferenceNumber = app.ReferenceNumber ?? app.ApplicationNumber ?? app.Id.ToString(),
            FormNo = "NTC 1-25",
            RevisionNo = "03",
            RevisionDate = new DateOnly(2025, 3, 31)
        };

        var applicant = ResolveApplicant(app, applicantId);
        var person = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;
        var allFieldValues = GetApplicantFieldValues(app, applicant);

        var fullName = person != null
            ? $"{person.FirstName} {person.LastName}".Trim()
            : (company?.Name ?? $"{app.User?.FirstName} {app.User?.LastName}".Trim());

        var comp = model.Complainant;
        comp.Name = !string.IsNullOrWhiteSpace(fullName) ? fullName : "Complainant";
        comp.Sex = !string.IsNullOrWhiteSpace(person?.Sex) ? person.Sex : (app.User?.Sex ?? "N/A");
        comp.Nationality = !string.IsNullOrWhiteSpace(person?.Nationality) ? person.Nationality : "Filipino";

        var fullAddress = person?.Address ?? company?.Address ?? $"{app.User?.Unit} {app.User?.Street}".Trim();
        comp.ResidentialAddress = new Address { Street = fullAddress };
        comp.ContactNumber = person?.ContactNumber ?? company?.ContactNumber ?? app.User?.ContactNumber ?? "";
        comp.Email = person?.EmailAddress ?? company?.Email ?? app.User?.Email ?? "";

        var civilVal = FindFieldValue(allFieldValues, "civil_status", "civil status");
        comp.CivilStatus = !string.IsNullOrWhiteSpace(civilVal) ? civilVal : "Single";

        // Service Provider Particulars
        var sp = model.ServiceProvider;
        sp.BusinessName = FindFieldValue(allFieldValues, "provider_business_name", "business name", "telecommunications provider", "broadcast_station") ?? "";
        sp.BusinessAddress = FindFieldValue(allFieldValues, "provider_business_address", "business address") ?? "";
        sp.ContactNumber = FindFieldValue(allFieldValues, "provider_contact_number", "provider contact") ?? "";

        // Nature of Complaint
        var nat = model.NatureOfComplaint;
        var complaintTypesVal = FindFieldValue(allFieldValues, "complaint_types", "nature of complaint") ?? "";
        if (!string.IsNullOrWhiteSpace(complaintTypesVal))
        {
            var trimmed = complaintTypesVal.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var el in doc.RootElement.EnumerateArray())
                        {
                            var s = el.GetString();
                            if (!string.IsNullOrWhiteSpace(s)) nat.ComplaintTypes.Add(s);
                        }
                    }
                }
                catch
                {
                    nat.ComplaintTypes.Add(complaintTypesVal);
                }
            }
            else
            {
                nat.ComplaintTypes.AddRange(complaintTypesVal.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
            }
        }

        if (nat.ComplaintTypes.Count == 0)
        {
            var primaryVariant = applicant?.ServiceVariant ?? app.ApplicationApplicants?.Select(aa => aa.Applicant?.ServiceVariant).FirstOrDefault(v => v != null);
            var vDesc = (primaryVariant?.Description ?? primaryVariant?.Type.ToString() ?? string.Empty).ToLowerInvariant();
            if (vDesc.Contains("spam")) nat.ComplaintTypes.Add("Spam");
            else if (vDesc.Contains("scam")) nat.ComplaintTypes.Add("Scam");
            else if (vDesc.Contains("service")) nat.ComplaintTypes.Add("Poor Service (Technical Service/Customer Service)");
            else if (vDesc.Contains("tape")) nat.ComplaintTypes.Add("Request for Mandatory Tape Preservation");
            else nat.ComplaintTypes.Add("Billing Complaint");
        }

        nat.OthersSpecification = FindFieldValue(allFieldValues, "others_specification", "if others") ?? "";

        var dateVal = FindFieldValue(allFieldValues, "date_of_incident", "date of transaction");
        if (!string.IsNullOrWhiteSpace(dateVal) && DateOnly.TryParse(dateVal, out var pDate))
        {
            nat.DateOfIncident = pDate;
        }
        else
        {
            nat.DateOfIncident = DateOnly.FromDateTime(app.CreatedAt);
        }

        nat.TimeOfIncident = FindFieldValue(allFieldValues, "time_of_incident", "time of transaction", "time_of_airing") ?? "";

        // Details of Complaint
        model.StateBrieflyDetails = FindFieldValue(allFieldValues, "state_briefly_details", "details of complaint", "briefly details") ?? "";

        // Attached Proof Documents Repeater
        ExtractAttachedProofDocuments(allFieldValues, model);

        // Declaration
        model.Declaration = BuildDeclaration(app, comp.Name);

        return model;
    }

    // =========================================================================
    // Shared Mapping Helpers
    // =========================================================================

    private static EDGE.Domain.Entities.Applicant? ResolveApplicant(EDGE.Domain.Entities.Application app, Guid? applicantId)
    {
        var ordered = (app.ApplicationApplicants ?? Enumerable.Empty<ApplicationApplicant>())
            .OrderBy(aa => aa.SequenceOrder)
            .ToList();

        if (applicantId.HasValue && applicantId.Value != Guid.Empty)
        {
            var match = ordered.FirstOrDefault(aa => aa.ApplicantId == applicantId.Value || aa.Applicant?.Id == applicantId.Value);
            if (match?.Applicant != null) return match.Applicant;
        }

        return ordered.Select(aa => aa.Applicant).FirstOrDefault(a => a != null);
    }

    private static List<FormFieldValue> GetApplicantFieldValues(EDGE.Domain.Entities.Application app, EDGE.Domain.Entities.Applicant? applicant)
    {
        var submissions = app.FormSubmissions ?? Enumerable.Empty<FormSubmission>();
        if (applicant != null && applicant.Id != Guid.Empty)
        {
            var scoped = submissions
                .Where(fs => fs.ApplicantId == applicant.Id)
                .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
                .ToList();
            if (scoped.Count > 0) return scoped;
        }

        return submissions
            .SelectMany(fs => fs.FieldValues ?? Enumerable.Empty<FormFieldValue>())
            .ToList();
    }

    private static ApplicantPerson BuildApplicantPerson(
        EDGE.Domain.Entities.Application app,
        EDGE.Domain.Entities.Applicant? applicant,
        List<FormFieldValue> fields)
    {
        var detail = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;
        var user = app.User;

        var firstName = detail?.FirstName ?? FindFieldValue(fields, "first name", "firstName") ?? user?.FirstName ?? "";
        var middleName = detail?.MiddleName ?? FindFieldValue(fields, "middle name", "middleName") ?? "";
        var lastName = detail?.LastName ?? FindFieldValue(fields, "last name", "lastName") ?? user?.LastName ?? "";

        if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName))
        {
            var full = FindFieldValue(fields, "fullName", "full legal name", "applicantName") ?? company?.Name ?? "";
            var parts = full.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1)
            {
                lastName = parts[0];
            }
            else if (parts.Length >= 2)
            {
                firstName = string.Join(" ", parts.Take(parts.Length - 1));
                lastName = parts[^1];
            }
        }

        var dob = detail?.BirthDate != null && detail.BirthDate != default
            ? detail.BirthDate
            : (TryParseDateOnly(FindFieldValue(fields, "birthDate", "date of birth")) ?? new DateOnly(1990, 1, 1));

        var sexStr = detail?.Sex ?? FindFieldValue(fields, "sex") ?? user?.Sex ?? "Male";
        var sex = sexStr.StartsWith("F", StringComparison.OrdinalIgnoreCase) ? Sex.Female : Sex.Male;

        var nationality = !string.IsNullOrWhiteSpace(detail?.Nationality)
            ? detail.Nationality
            : (FindFieldValue(fields, "nationality", "citizenship") ?? "Filipino");

        var address = BuildAddress(app, applicant, fields);
        var contact = detail?.ContactNumber ?? FindFieldValue(fields, "contactNo", "contact / mobile number", "contact number") ?? company?.ContactNumber ?? user?.ContactNumber ?? "";
        var email = detail?.EmailAddress ?? FindFieldValue(fields, "email", "email address") ?? company?.Email ?? user?.Email ?? "";

        return new ApplicantPerson
        {
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            DateOfBirth = dob,
            Sex = sex,
            Nationality = nationality,
            Address = address,
            ContactNumber = contact,
            Email = email
        };
    }

    private static EDGE.Infrastructure.Printing.Models.Applicant BuildApplicantEntity(
        EDGE.Domain.Entities.Application app,
        EDGE.Domain.Entities.Applicant? applicant,
        List<FormFieldValue> fields)
    {
        var name = ResolveDisplayName(app, applicant, fields);
        var entityTypeStr = FindFieldValue(fields, "entityType", "entity type") ?? "";
        var entityType = EntityType.Other;
        if (entityTypeStr.Contains("Single", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.SingleProprietorship;
        else if (entityTypeStr.Contains("Partnership", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Partnership;
        else if (entityTypeStr.Contains("Corp", StringComparison.OrdinalIgnoreCase) || applicant?.ApplicantType == ApplicantType.Company || applicant?.CompanyDetail != null)
            entityType = EntityType.Corporation;

        var detail = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;
        var user = app.User;

        return new EDGE.Infrastructure.Printing.Models.Applicant
        {
            ApplicantId = applicant?.Id ?? app.Id,
            Name = name,
            TypeOfEntity = entityType,
            Address = BuildAddress(app, applicant, fields),
            ContactNumber = detail?.ContactNumber ?? company?.ContactNumber ?? FindFieldValue(fields, "contactNo", "contact number") ?? user?.ContactNumber ?? "",
            Email = detail?.EmailAddress ?? company?.Email ?? FindFieldValue(fields, "email", "email address") ?? user?.Email ?? ""
        };
    }

    private static string ResolveDisplayName(
        EDGE.Domain.Entities.Application app,
        EDGE.Domain.Entities.Applicant? applicant,
        List<FormFieldValue> fields)
    {
        var companyName = applicant?.CompanyDetail?.Name
            ?? FindFieldValue(fields, "companyName", "company / business name")
            ?? (applicant?.ApplicantType == ApplicantType.Company ? app.User?.CompanyDetail?.Name : null);

        if (!string.IsNullOrWhiteSpace(companyName))
            return companyName.Trim();

        var detail = applicant?.ApplicantDetail;
        if (detail != null)
        {
            var personName = string.Join(" ", new[] { detail.FirstName, detail.MiddleName, detail.LastName, detail.Suffix }
                .Where(s => !string.IsNullOrWhiteSpace(s))).Trim();
            if (!string.IsNullOrWhiteSpace(personName))
                return personName;
        }

        var fieldFullName = FindFieldValue(fields, "fullName", "full legal name", "applicantName", "registeredOwner");
        if (!string.IsNullOrWhiteSpace(fieldFullName))
            return fieldFullName.Trim();

        if (app.User != null)
        {
            var userName = $"{app.User.FirstName} {app.User.LastName}".Trim();
            if (!string.IsNullOrWhiteSpace(userName))
                return userName;
        }

        return "Applicant";
    }

    private static Address BuildAddress(
        EDGE.Domain.Entities.Application app,
        EDGE.Domain.Entities.Applicant? applicant,
        List<FormFieldValue> fields)
    {
        var detail = applicant?.ApplicantDetail;
        var company = applicant?.CompanyDetail ?? app.User?.CompanyDetail;
        var user = app.User;

        var street = FindFieldValue(fields, "street", "street address")
            ?? detail?.Address
            ?? company?.Address
            ?? FindFieldValue(fields, "address", "complete address")
            ?? user?.Street
            ?? "";
        var barangay = FindFieldValue(fields, "barangay") ?? "";
        var city = FindFieldValue(fields, "city", "city / municipality") ?? "";
        var province = FindFieldValue(fields, "province") ?? "";
        var zip = FindFieldValue(fields, "zipCode", "zip / postal code") ?? "";

        return new Address
        {
            UnitRoomBldgNo = user?.Unit ?? "",
            Street = street,
            Barangay = barangay,
            CityMunicipality = city,
            Province = province,
            ZipCode = zip
        };
    }

    private static TypeOfApplication ResolveTypeOfApplication(ServiceVariant? variant, List<FormFieldValue> fields)
    {
        if (variant != null)
        {
            if (variant.Type == ServiceVariantType.Renewal) return TypeOfApplication.Renewal;
            if (variant.Type == ServiceVariantType.Modification) return TypeOfApplication.Modification;
            var desc = (variant.Description ?? "").ToUpperInvariant();
            if (desc.Contains("RENEWAL")) return TypeOfApplication.Renewal;
            if (desc.Contains("MODIFICATION")) return TypeOfApplication.Modification;
        }

        var appTypeStr = FindFieldValue(fields, "appType", "application type") ?? "";
        if (appTypeStr.Contains("RENEWAL", StringComparison.OrdinalIgnoreCase)) return TypeOfApplication.Renewal;
        if (appTypeStr.Contains("MODIFICATION", StringComparison.OrdinalIgnoreCase)) return TypeOfApplication.Modification;

        return TypeOfApplication.New;
    }

    private static int? ResolveNoOfYears(List<FormFieldValue> fields, EDGE.Domain.Entities.Application app, EDGE.Domain.Entities.Applicant? applicant)
    {
        var yrStr = FindFieldValue(fields, "noOfYears", "number of years");
        if (!string.IsNullOrWhiteSpace(yrStr) && int.TryParse(yrStr.Trim(), out var yrs) && yrs > 0)
            return yrs;

        return 3;
    }

    private static Payment? BuildPayment(EDGE.Domain.Entities.Application app, EDGE.Domain.Entities.Applicant? applicant)
    {
        var soa = (app.StatementsOfAccount ?? Enumerable.Empty<StatementOfAccount>())
            .FirstOrDefault(s => !s.IsDeleted && (applicant == null || s.ApplicantId == applicant.Id));

        var op = (app.OrdersOfPayment ?? Enumerable.Empty<OrderOfPayment>())
            .Where(o => !o.IsDeleted && (soa == null || o.StatementOfAccountId == soa.Id))
            .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
            .FirstOrDefault()
            ?? (app.OrdersOfPayment ?? Enumerable.Empty<OrderOfPayment>())
                .OrderByDescending(o => o.PaidAt ?? o.CreatedAt)
                .FirstOrDefault();

        if (op == null || string.IsNullOrWhiteSpace(op.OfficialReceiptNumber))
            return null;

        return new Payment
        {
            PaymentId = op.Id,
            ApplicationId = app.Id,
            OrNo = op.OfficialReceiptNumber,
            OrDate = DateOnly.FromDateTime(op.PaidAt ?? op.CreatedAt),
            Amount = op.AmountReceived > 0 ? op.AmountReceived : op.AmountDue,
            CollectingOfficer = "Special Collecting Officer"
        };
    }

    private static Declaration BuildDeclaration(EDGE.Domain.Entities.Application app, string signatoryName)
    {
        return new Declaration
        {
            SignatoryName = !string.IsNullOrWhiteSpace(signatoryName) ? signatoryName : "Applicant",
            DateAccomplished = DateOnly.FromDateTime(app.CreatedAt != default ? app.CreatedAt : DateTime.UtcNow)
        };
    }

    private static ClassOfStation BuildClassOfStation(List<FormFieldValue> fields)
    {
        var cos = new ClassOfStation();
        var stationClassStr = (FindFieldValue(fields, "stationClass", "aeroClassOfStation", "classOfStation", "station class") ?? "").ToUpperInvariant();
        if (stationClassStr == "RT") cos.RT = 1;
        else if (stationClassStr == "FX") cos.FX = 1;
        else if (stationClassStr == "FB") cos.FB = 1;
        else if (stationClassStr == "FX/FB") { cos.FX = 1; cos.FB = 1; }
        else if (stationClassStr == "ML") cos.ML = 1;
        else if (stationClassStr == "P") cos.P = 1;
        else if (stationClassStr == "BC") cos.BC = 1;
        else if (stationClassStr == "FC") cos.FC = 1;
        else if (stationClassStr == "FA") cos.FA = 1;
        else if (stationClassStr == "MA") cos.MA = 1;
        else if (stationClassStr == "TC") cos.TC = 1;
        else if (!string.IsNullOrWhiteSpace(stationClassStr)) cos.Other = stationClassStr;
        else cos.FX = 1;

        return cos;
    }

    private static Antenna? BuildSingleAntenna(List<FormFieldValue> fields)
    {
        var type = FindFieldValue(fields, "antennaType", "antenna type");
        var heightStr = FindFieldValue(fields, "height", "antenna height");
        var gainStr = FindFieldValue(fields, "gain", "antenna gain");
        var dirStr = FindFieldValue(fields, "directivity", "antenna directivity");
        var pol = FindFieldValue(fields, "polarization", "antenna polarization");

        if (string.IsNullOrWhiteSpace(type) && string.IsNullOrWhiteSpace(heightStr) && string.IsNullOrWhiteSpace(pol))
            return null;

        double.TryParse(heightStr, out var h);
        double.TryParse(gainStr, out var g);
        double.TryParse(dirStr, out var d);

        return new Antenna
        {
            AntennaId = Guid.NewGuid(),
            Type = type ?? "Omnidirectional",
            HeightM = h,
            GainDbi = g,
            DirectivityDegrees = d,
            Polarization = pol ?? "Vertical"
        };
    }

    private static List<Equipment> ExtractEquipmentList(Guid applicationId, List<FormFieldValue> fields)
    {
        var list = new List<Equipment>();
        var repField = FindField(fields, "equipmentDetails", "particulars", "proposedEquipments", "particulars of equipment");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            var make = GetJsonString(row, "make", "makeTypeModel", "makeModel") ?? "";
                            var model = GetJsonString(row, "model", "typeModel", "makeTypeModel") ?? "";
                            var serial = GetJsonString(row, "serialNumber", "serial", "serialNumbers") ?? "";
                            var power = GetJsonString(row, "powerOutput", "power") ?? "";
                            var freq = GetJsonString(row, "frequencyRange", "frequency") ?? "";
                            var qtyStr = GetJsonString(row, "quantity", "noOfUnits") ?? "1";
                            int.TryParse(qtyStr, out var qty);

                            list.Add(new Equipment
                            {
                                EquipmentId = Guid.NewGuid(),
                                ApplicationId = applicationId,
                                RadioEquipment = !string.IsNullOrWhiteSpace(make) ? make : "Radio Transceiver",
                                Make = make,
                                TypeModel = model,
                                SerialNumber = serial,
                                PowerOutput = power,
                                FrequencyRange = freq,
                                Quantity = Math.Max(1, qty)
                            });
                        }
                    }
                }
                catch
                {
                    // Fallback to scalar fields
                }
            }
        }

        if (list.Count == 0)
        {
            var makeModel = FindFieldValue(fields, "makeModel", "makeTypeModel", "aircraftMakeModel");
            var serial = FindFieldValue(fields, "serialNumber", "serialNumbers", "aircraftSerialNo");
            var power = FindFieldValue(fields, "powerOutput", "authorizedPower");
            var freq = FindFieldValue(fields, "frequencyRange", "frequency", "frequencyBands");

            if (!string.IsNullOrWhiteSpace(makeModel) || !string.IsNullOrWhiteSpace(serial) || !string.IsNullOrWhiteSpace(power) || !string.IsNullOrWhiteSpace(freq))
            {
                list.Add(new Equipment
                {
                    EquipmentId = Guid.NewGuid(),
                    ApplicationId = applicationId,
                    RadioEquipment = makeModel ?? "Radio Transceiver",
                    Make = makeModel ?? "",
                    TypeModel = makeModel ?? "",
                    SerialNumber = serial ?? "",
                    PowerOutput = power ?? "",
                    FrequencyRange = freq ?? "",
                    Quantity = 1
                });
            }
        }

        return list;
    }

    private static List<Station> ExtractStationsList(Guid applicationId, List<FormFieldValue> fields)
    {
        var list = new List<Station>();
        var repField = FindField(fields, "particulars", "stations");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            list.Add(new Station
                            {
                                StationId = Guid.NewGuid(),
                                ApplicationId = applicationId,
                                ExactLocation = GetJsonString(row, "exactLocation", "stationLocation", "location") ?? "",
                                Longitude = GetJsonString(row, "longitude") ?? "",
                                Latitude = GetJsonString(row, "latitude") ?? "",
                                PointsOfCommServiceArea = GetJsonString(row, "serviceArea") ?? (FindFieldValue(fields, "serviceArea") ?? ""),
                                AssignedFreq = GetJsonString(row, "frequency") ?? (FindFieldValue(fields, "frequency") ?? ""),
                                BwEmission = FindFieldValue(fields, "emission") ?? "",
                                Configuration = GetJsonString(row, "configuration") ?? "",
                                DataRate = GetJsonString(row, "dataRate") ?? "",
                                CallSign = GetJsonString(row, "callSign") ?? (FindFieldValue(fields, "callSign") ?? ""),
                                Others = GetJsonString(row, "remarks") ?? "",
                                Antenna = BuildSingleAntenna(fields)
                            });
                        }
                    }
                }
                catch
                {
                    // Ignore JSON errors
                }
            }
        }

        return list;
    }

    private static List<RadioOperatorDetails> ExtractRadioOperators(List<FormFieldValue> fields)
    {
        var list = new List<RadioOperatorDetails>();
        var repField = FindField(fields, "radioOfficers", "radio officers");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            var name = GetJsonString(row, "officerName", "name") ?? "";
                            var cert = GetJsonString(row, "certificateNumber", "certificateNo") ?? "";
                            var exp = TryParseDateOnly(GetJsonString(row, "expiryDate", "validity")) ?? default;
                            if (!string.IsNullOrWhiteSpace(name) || !string.IsNullOrWhiteSpace(cert))
                            {
                                list.Add(new RadioOperatorDetails
                                {
                                    Name = name,
                                    CertificateNumber = cert,
                                    Validity = exp
                                });
                            }
                        }
                    }
                }
                catch
                {
                    // Fallback to scalar fields
                }
            }
        }

        if (list.Count == 0)
        {
            var name = FindFieldValue(fields, "officerName", "officer / technician name");
            var cert = FindFieldValue(fields, "certificateNumber", "certificate / registration number");
            if (!string.IsNullOrWhiteSpace(name) || !string.IsNullOrWhiteSpace(cert))
            {
                list.Add(new RadioOperatorDetails
                {
                    Name = name ?? "",
                    CertificateNumber = cert ?? "",
                    Validity = TryParseDateOnly(FindFieldValue(fields, "expiryDate")) ?? default
                });
            }
        }

        return list;
    }

    private static List<Device> ExtractDevices119(List<FormFieldValue> fields)
    {
        var list = new List<Device>();
        var repField = FindField(fields, "devicesDetails", "registered devices");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            var makeModel = GetJsonString(row, "makeTypeModel", "makeModel", "make") ?? "";
                            var serial = GetJsonString(row, "serialNumber", "serialNumbers", "serial") ?? "";
                            var qtyStr = GetJsonString(row, "quantity", "noOfUnits") ?? "1";
                            int.TryParse(qtyStr, out var qty);

                            list.Add(new Device
                            {
                                DeviceId = Guid.NewGuid(),
                                MakeTypeModel = makeModel,
                                Quantity = Math.Max(1, qty),
                                SerialNumber = serial
                            });
                        }
                    }
                }
                catch
                {
                    // Fallback
                }
            }
        }

        if (list.Count == 0)
        {
            var makeModel = FindFieldValue(fields, "makeTypeModel", "makeModel") ?? "Registered Wireless Device";
            var serial = FindFieldValue(fields, "serialNumbers", "serialNumber") ?? "";
            list.Add(new Device
            {
                DeviceId = Guid.NewGuid(),
                MakeTypeModel = makeModel,
                Quantity = 1,
                SerialNumber = serial
            });
        }

        return list;
    }

    private static TvroEquipmentDetails ExtractTvroEquipment(List<FormFieldValue> fields)
    {
        var repField = FindField(fields, "tvroEquipment", "tvroDetails");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                    {
                        var first = doc.RootElement[0];
                        return new TvroEquipmentDetails
                        {
                            MakeTypeModel = GetJsonString(first, "makeTypeModel", "makeModel", "make") ?? "",
                            SerialNumber = GetJsonString(first, "serialNumber", "serial") ?? "",
                            FrequencyRange = GetJsonString(first, "frequencyRange", "frequency") ?? ""
                        };
                    }
                }
                catch { }
            }
        }

        return new TvroEquipmentDetails
        {
            MakeTypeModel = FindFieldValue(fields, "makeTypeModel", "makeModel") ?? "",
            SerialNumber = FindFieldValue(fields, "serialNumber") ?? "",
            FrequencyRange = FindFieldValue(fields, "frequencyRange", "carrierFrequency") ?? ""
        };
    }

    private static AntennaSystemDetails ExtractTvroAntenna(List<FormFieldValue> fields)
    {
        var repField = FindField(fields, "tvroAntenna");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                    {
                        var first = doc.RootElement[0];
                        return new AntennaSystemDetails
                        {
                            DishDiameter = GetJsonString(first, "dishDiameter", "diameter") ?? "",
                            Polarization = GetJsonString(first, "polarization") ?? "",
                            Azimuth = GetJsonString(first, "azimuth") ?? ""
                        };
                    }
                }
                catch { }
            }
        }

        return new AntennaSystemDetails
        {
            DishDiameter = FindFieldValue(fields, "diameter", "dishDiameter") ?? "",
            Polarization = FindFieldValue(fields, "polarization") ?? "",
            Azimuth = FindFieldValue(fields, "azimuth") ?? ""
        };
    }

    private static SignalToBeReceivedDetails ExtractTvroSignal(List<FormFieldValue> fields)
    {
        var repField = FindField(fields, "tvroSignal");
        if (repField != null && !string.IsNullOrWhiteSpace(repField.Value))
        {
            var trimmed = repField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
                    {
                        var first = doc.RootElement[0];
                        return new SignalToBeReceivedDetails
                        {
                            Satellite = GetJsonString(first, "satellite") ?? "",
                            Polarization = GetJsonString(first, "polarization") ?? "",
                            ReceivedFrequency = GetJsonString(first, "receivedFrequency", "frequency") ?? "",
                            NameOfPrograms = GetJsonString(first, "nameOfPrograms", "programs") ?? ""
                        };
                    }
                }
                catch { }
            }
        }

        return new SignalToBeReceivedDetails
        {
            Satellite = FindFieldValue(fields, "satellite") ?? "",
            Polarization = FindFieldValue(fields, "polarization") ?? "",
            ReceivedFrequency = FindFieldValue(fields, "carrierFrequency", "frequency") ?? "",
            NameOfPrograms = FindFieldValue(fields, "program_name") ?? ""
        };
    }

    private static ExamCode ResolveExamCode(string elementsText, string vDesc)
    {
        var upper = $"{elementsText} {vDesc}".ToUpperInvariant();
        if (upper.Contains("2RTG")) return ExamCode.Rtg2_Elements1_2_5_6_Code16Wpm;
        if (upper.Contains("3RTG")) return ExamCode.Rtg3_Elements1_2_5_Code16Wpm;
        if (upper.Contains("1RTG") || upper.Contains("RADIOTELEGRAPHY")) return ExamCode.Rtg1_Elements1_2_5_6_Code2520Wpm;
        if (upper.Contains("2PHN")) return ExamCode.Phn2_Elements1_2_3;
        if (upper.Contains("3PHN")) return ExamCode.Phn3_Elements1_2;
        if (upper.Contains("1PHN") || upper.Contains("RADIOTELEPHONY")) return ExamCode.Phn1_Elements1_2_3_4;
        if (upper.Contains("CLASS A")) return ExamCode.ClassA_Elements8_9_10_Code5Wpm;
        if (upper.Contains("CLASS B")) return ExamCode.ClassB_Elements5_6_7;
        if (upper.Contains("CLASS C")) return ExamCode.ClassC_Elements2_3_4;
        if (upper.Contains("CLASS D") || upper.Contains("AMATEUR")) return ExamCode.ClassD_Element2;
        return ExamCode.RrocAircraft_Element1;
    }

    private static (TypeOfCertificate Type, string? OtherDetails) ResolveCertificateType102(string certTypeStr, string vDesc)
    {
        var upper = $"{certTypeStr} {vDesc}".ToUpperInvariant();
        if (upper.Contains("1RTG")) return (TypeOfCertificate.Rtg1, null);
        if (upper.Contains("2RTG")) return (TypeOfCertificate.Rtg2, null);
        if (upper.Contains("3RTG")) return (TypeOfCertificate.Rtg3, null);
        if (upper.Contains("1PHN")) return (TypeOfCertificate.Phn1, null);
        if (upper.Contains("2PHN")) return (TypeOfCertificate.Phn2, null);
        if (upper.Contains("3PHN")) return (TypeOfCertificate.Phn3, null);
        if (upper.Contains("FOREIGN PILOT") || upper.Contains("TEMPORARY") || upper.Contains("TP RROC")) return (TypeOfCertificate.TpRrocAircraft, null);
        if (upper.Contains("AIRCRAFT") || upper.Contains("RROC-AIRCRAFT")) return (TypeOfCertificate.RrocAircraft, null);
        if (upper.Contains("GOVERNMENT") || upper.Contains("GROC")) return (TypeOfCertificate.Groc, null);
        if (upper.Contains("LAND MOBILE") || upper.Contains("RLM")) return (TypeOfCertificate.Rlm, null);
        if (upper.Contains("SPECIAL") || upper.Contains("SROP")) return (TypeOfCertificate.Srop, null);
        if (upper.Contains("COMMERCIAL")) return (TypeOfCertificate.Phn1, null);
        return (TypeOfCertificate.Others, certTypeStr);
    }

    private static DateOnly? TryParseDateOnly(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        if (DateOnly.TryParse(raw.Trim(), out var d)) return d;
        if (DateTime.TryParse(raw.Trim(), out var dt)) return DateOnly.FromDateTime(dt);
        return null;
    }

    private static string? GetJsonString(JsonElement obj, params string[] propertyNames)
    {
        if (obj.ValueKind != JsonValueKind.Object) return null;
        foreach (var prop in obj.EnumerateObject())
        {
            if (propertyNames.Any(p => string.Equals(prop.Name, p, StringComparison.OrdinalIgnoreCase)))
            {
                return prop.Value.ValueKind switch
                {
                    JsonValueKind.String => prop.Value.GetString(),
                    JsonValueKind.Number => prop.Value.ToString(),
                    JsonValueKind.True => "true",
                    JsonValueKind.False => "false",
                    _ => null
                };
            }
        }
        return null;
    }

    private static void ExtractDeviceParticulars(List<FormFieldValue> fieldValues, Ntc124Application model)
    {
        var devField = FindField(fieldValues, "device_particulars", "device particulars");
        if (devField != null && !string.IsNullOrWhiteSpace(devField.Value))
        {
            var trimmed = devField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        var imeis = new List<string>();
                        var models = new List<string>();

                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            if (row.TryGetProperty("imei_number", out var i) || row.TryGetProperty("imei", out i))
                            {
                                var iv = i.GetString() ?? (i.ValueKind == JsonValueKind.Number ? i.GetInt64().ToString() : "");
                                if (!string.IsNullOrWhiteSpace(iv)) imeis.Add(iv);
                            }
                            if (row.TryGetProperty("make_model_type", out var m) || row.TryGetProperty("model", out m) || row.TryGetProperty("make", out m))
                            {
                                var mv = m.GetString();
                                if (!string.IsNullOrWhiteSpace(mv)) models.Add(mv);
                            }
                        }

                        if (imeis.Count > 0) model.ImeiNo = string.Join(" / ", imeis);
                        if (models.Count > 0) model.MakeModelType = string.Join(" / ", models);
                    }
                }
                catch
                {
                    model.MakeModelType = devField.Value;
                }
            }
            else
            {
                model.MakeModelType = devField.Value;
            }
        }

        if (string.IsNullOrWhiteSpace(model.MakeModelType))
        {
            model.MakeModelType = FindFieldValue(fieldValues, "make_model_type", "make / model / type") ?? "";
        }
        if (string.IsNullOrWhiteSpace(model.ImeiNo))
        {
            model.ImeiNo = FindFieldValue(fieldValues, "imei_number", "imei") ?? "";
        }

        // SIM Numbers Repeater
        var simField = FindField(fieldValues, "sim_mobile_numbers", "sim mobile");
        if (simField != null && !string.IsNullOrWhiteSpace(simField.Value))
        {
            var trimmed = simField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        var nums = new List<string>();
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            if (row.TryGetProperty("mobile_number", out var num) || row.TryGetProperty("mobile", out num) || row.TryGetProperty("sim", out num))
                            {
                                var nv = num.GetString();
                                if (!string.IsNullOrWhiteSpace(nv)) nums.Add(nv);
                            }
                        }
                        if (nums.Count > 0) model.SimMobileNumber = string.Join(" / ", nums);
                    }
                }
                catch
                {
                    model.SimMobileNumber = simField.Value;
                }
            }
            else
            {
                model.SimMobileNumber = simField.Value;
            }
        }

        if (string.IsNullOrWhiteSpace(model.SimMobileNumber))
        {
            model.SimMobileNumber = FindFieldValue(fieldValues, "mobile_number") ?? model.TelephoneNumber;
        }
    }

    private static void ExtractAttachedProofDocuments(List<FormFieldValue> fieldValues, Ntc125Application model)
    {
        var attField = FindField(fieldValues, "attached_proof_documents", "attached proof");
        if (attField != null && !string.IsNullOrWhiteSpace(attField.Value))
        {
            var trimmed = attField.Value.Trim();
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var row in doc.RootElement.EnumerateArray())
                        {
                            var desc = "";
                            var file = "";
                            if (row.TryGetProperty("document_description", out var d)) desc = d.GetString() ?? "";
                            if (row.TryGetProperty("attachment_file", out var f)) file = f.GetString() ?? "";

                            if (!string.IsNullOrWhiteSpace(desc) || !string.IsNullOrWhiteSpace(file))
                            {
                                model.AttachedProofDocuments.Add(new AttachedProofDocument
                                {
                                    DocumentDescription = !string.IsNullOrWhiteSpace(desc) ? desc : "Supporting Document",
                                    AttachmentFileName = !string.IsNullOrWhiteSpace(file) ? file : "Document_Proof.pdf"
                                });
                            }
                        }
                    }
                }
                catch
                {
                    // Ignore JSON parsing issues
                }
            }
        }
    }

    private static AgeGroup124 ResolveAgeGroup(string raw, int numericAge)
    {
        var lower = raw.ToLowerInvariant();
        if (lower.Contains("below 18") || lower.Contains("<18")) return AgeGroup124.Below18;
        if (lower.Contains("18-29") || lower.Contains("18_29") || lower.Contains("18 to 29")) return AgeGroup124.Age18_29;
        if (lower.Contains("30-39") || lower.Contains("30_39") || lower.Contains("30 to 39")) return AgeGroup124.Age30_39;
        if (lower.Contains("40-49") || lower.Contains("40_49") || lower.Contains("40 to 49")) return AgeGroup124.Age40_49;
        if (lower.Contains("50-59") || lower.Contains("50_59") || lower.Contains("50 to 59")) return AgeGroup124.Age50_59;
        if (lower.Contains("60")) return AgeGroup124.Age60Up;

        if (numericAge > 0)
        {
            if (numericAge < 18) return AgeGroup124.Below18;
            if (numericAge <= 29) return AgeGroup124.Age18_29;
            if (numericAge <= 39) return AgeGroup124.Age30_39;
            if (numericAge <= 49) return AgeGroup124.Age40_49;
            if (numericAge <= 59) return AgeGroup124.Age50_59;
            return AgeGroup124.Age60Up;
        }

        return AgeGroup124.Age18_29;
    }

    private static string? FindFieldValue(List<FormFieldValue> fieldValues, params string[] keywords)
    {
        var f = FindField(fieldValues, keywords);
        return f?.Value;
    }

    private static FormFieldValue? FindField(List<FormFieldValue> fieldValues, params string[] keywords)
    {
        return fieldValues.FirstOrDefault(f => MatchesKey(f, keywords));
    }

    private static bool MatchesKey(FormFieldValue f, params string[] keywords)
    {
        var label = (f.CustomLabel ?? f.Field?.Label ?? string.Empty).ToLowerInvariant();
        return keywords.Any(k => label.Contains(k.ToLowerInvariant()));
    }
}
