using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class ExamsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000001");
    public static readonly Guid Svc101Id   = Guid.Parse("50000000-0000-0000-0000-000000000001");

    public static readonly string Ntc101Contract = @"
    {
        ""formNo"": ""NTC 1-01"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Exams"",
        ""group"": null,
        ""applicationTypes"": [""New""],
        ""examineeTypes"": [""FirstTaker"", ""Retaker""],
        ""elements"": [
            { ""code"": ""1RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For removal"", ""description"": ""Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For upgrade (2RTG Holder)"", ""description"": ""& Code (25/20 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (16 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""For removal"", ""description"": ""Code (16 wpm)"" },
            { ""code"": ""3RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5 & Code (16 wpm)"" },
            { ""code"": ""3RTG"", ""condition"": ""For removal"", ""description"": ""Code (16 wpm)"" },
            { ""code"": ""1PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 3 & 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (2PHN Holder)"", ""description"": ""Element 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (3PHN Holder)"", ""description"": ""Element 3 & 4"" },
            { ""code"": ""2PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2 & 3"" },
            { ""code"": ""3PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1 & 2"" },
            { ""code"": ""Class A"", ""condition"": ""Standard"", ""description"": ""Elements 8, 9, 10 & Code (5 wpm)"" },
            { ""code"": ""Class A"", ""condition"": ""For removal"", ""description"": ""Code (5 wpm)"" },
            { ""code"": ""Class B"", ""condition"": ""Standard"", ""description"": ""Elements 5, 6 & 7"" },
            { ""code"": ""Class B"", ""condition"": ""For Registered ECE/1PHN/1RTG/2RTG Holder"", ""description"": ""Element 2"" },
            { ""code"": ""Class C"", ""condition"": ""Standard"", ""description"": ""Elements 2, 3 & 4"" },
            { ""code"": ""Class C"", ""condition"": ""For Class D Holder"", ""description"": ""Elements 3 & 4"" },
            { ""code"": ""Class D"", ""condition"": ""Standard"", ""description"": ""Element 2"" },
            { ""code"": ""RROC-Aircraft"", ""condition"": ""Standard"", ""description"": ""Element 1"" }
        ],
        ""requiredSections"": [
            { ""key"": ""applicantPerson"", ""required"": true },
            { ""key"": ""applicantEducation"", ""required"": false },
            { ""key"": ""assistanceRequest"", ""required"": false },
            { ""key"": ""declaration"", ""required"": true }
        ],
        ""allowsBulkSubmission"": true,
        ""categorySpecific"": {
            ""examCategories"": [""Radiotelegraphy"", ""Radiotelephony"", ""Amateur"", ""Restricted Radio Operator Certificate - Aircraft""]
        },
        ""requirementDiscriminatorFields"": [""Exam Category"", ""Examinee Type""],
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_01"] = Ntc101Contract,
        ["EXAM_RTG"] = Ntc101Contract,
        ["EXAM_RTP"] = Ntc101Contract,
        ["EXAM_AMA"] = Ntc101Contract,
        ["EXAM_RROC_AC"] = Ntc101Contract,
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_01", Svc101Id, categoryId, "Admission Slip for Radio Operator Examination", null, "NTC_1_01", "Admission Slip for Radio Operator Examination (NTC 1-01)", Ntc101Contract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        // Radiotelegraphy (RTG)
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelegraphy - First Commercial Class (1RTG)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000032"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelegraphy - Second Commercial Class (2RTG)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000033"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelegraphy - Third Commercial Class (3RTG)"),

        // Radiotelephony (RTP)
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelephony - First Commercial Class (1PHN)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000035"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelephony - Second Commercial Class (2PHN)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000036"), Svc101Id, ServiceVariantType.FirstTaker, "Radiotelephony - Third Commercial Class (3PHN)"),

        // Amateur (AMA)
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), Svc101Id, ServiceVariantType.FirstTaker, "Amateur - Class A (Extra Class)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000038"), Svc101Id, ServiceVariantType.FirstTaker, "Amateur - Class B (General Class)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), Svc101Id, ServiceVariantType.FirstTaker, "Amateur - Class C / D (Technician / Novice)"),

        // RROC Aircraft
        new(Guid.Parse("60000000-0000-0000-0000-000000000040"), Svc101Id, ServiceVariantType.FirstTaker, "Restricted Radio Operator Certificate - Aircraft"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000041"), Svc101Id, ServiceVariantType.Retaker, "Restricted Radio Operator Certificate - Aircraft (Retake)")
    };

    public static List<VariantElementDef> GetBackfillElements() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-STD", "Elements 1, 2, 5, 6 & Code (25/20 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-REM", "Code (25/20 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), "1RTG-UPG", "& Code (25/20 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000032"), "2RTG-STD", "Elements 1, 2, 5, 6 & Code (16 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000032"), "2RTG-REM", "Code (16 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000033"), "3RTG-STD", "Elements 1, 2, 5 & Code (16 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000033"), "3RTG-REM", "Code (16 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-STD", "Elements 1, 2, 3 & 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-UPG2", "Element 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), "1PHN-UPG3", "Element 3 & 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000035"), "2PHN-STD", "Elements 1, 2 & 3"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000036"), "3PHN-STD", "Elements 1 & 2"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), "CLSA-STD", "Elements 8, 9, 10 & Code (5 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), "CLSA-REM", "Code (5 wpm)"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000038"), "CLSB-STD", "Elements 5, 6 & 7"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000038"), "CLSB-UPG", "Element 2"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), "CLSC-STD", "Elements 2, 3 & 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), "CLSC-UPG", "Elements 3 & 4"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), "CLSD-STD", "Element 2"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000040"), "RROC-STD", "Element 1")
    };

    public static List<ServiceNoteDef> GetBackfillNotes(Guid svc101) => new()
    {
        new(svc101, null, "Radio Operator Examination: Standard examination rules apply. Passing grade is 70% per element. Retakes allowed after 30 days.")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["RATING"] = new(Guid.Parse("70000000-0000-0000-0000-000000000001"), "Report of Rating", "Official examination rating report issued by NTC."),
        ["GOOD_MORAL"] = new(Guid.Parse("70000000-0000-0000-0000-000000000002"), "Certificate of Good Moral Character", "Issued by school, employer, or local barangay authority."),
        ["PHOTO"] = new(Guid.Parse("70000000-0000-0000-0000-000000000003"), "1x1 ID Picture", "Recent passport-style photo with white background taken within last 6 months."),
        ["TRANSCRIPT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000004"), "Transcript of Records / Diploma", "Official scholastic records or certificate of completion for relevant course."),
        ["ROC"] = new(Guid.Parse("70000000-0000-0000-0000-000000000005"), "Radio Operator Certificate", "Valid ROC issued by NTC (for upgrade or renewal applicants)."),
        ["BIRTH_CERT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000006"), "PSA Birth Certificate", "Certified true copy of birth certificate from the Philippine Statistics Authority."),
        ["OR_CR"] = new(Guid.Parse("70000000-0000-0000-0000-000000000007"), "Official Receipt / Certificate of Registration", "Proof of prior payment or registration with NTC."),
        ["SPECIAL_NEEDS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000008"), "Medical Certificate / PWD ID", "Supporting document for applicants requesting special examination accommodations.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // Radiotelegraphy (RTG)
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000031"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000032"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000033"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),

        // Radiotelephony (RTP)
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000002"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000034"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000035"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000036"), Guid.Parse("70000000-0000-0000-0000-000000000005"), true),

        // Amateur (AMA)
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000001"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000006"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000037"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000038"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000039"), Guid.Parse("70000000-0000-0000-0000-000000000007"), true),

        // RROC Aircraft
        new(Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000008"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000040"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000003"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000041"), Guid.Parse("70000000-0000-0000-0000-000000000004"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_01", Guid.Parse("f0100000-0000-0000-0000-000000000001"), Guid.Parse("f01a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicantPerson", "Personal Information", new() { "fullName", "birthDate", "sex", "civilStatus", "nationality" }),
            new("applicantAddress", "Address Information", new() { "region", "province", "city", "barangay", "street", "zipCode" }),
            new("applicantContact", "Contact Information", new() { "contactNo", "email" }),
            new("applicantEducation", "Educational Background", new() { "schoolName", "courseDegree", "yearGraduated" }),
            new("assistanceRequest", "Special Needs Assistance", new() { "specialNeeds" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000008"),
            new[] { "Admission Slip", "Radio Operator Examination", "EXAM", "Exam" },
            "Admission Slip for Radio Operator Examination\n\nThe Admission Slip is a document issued by the Commission to a qualified applicant authorizing the holder thereof to take the commercial or non-commercial radio operator examination.",
            "WHO MAY AVAIL:\n\n1. Restricted Radio Operator Certificate (RROC) - Aircraft\n• Commercial pilots\n• Student pilots\n\n2. Radiotelephone/Radiotelegraph\n• Graduates of General Radio Communication Operator (GRCO)\n• Graduates of Industrial Electronics Technician Course (IETC)\n• Graduates of Communications Technician Course (CTC)\n• Graduates of Bachelor of Science in Avionics Technology (BS AVTECH)\n• Graduates of Bachelor of Science in Electronics and Communications Engineering; Bachelor of Science in Electronics Engineering (BS ECE)\n\n3. Amateur\n• Radio enthusiasts\n• Licensed amateurs and commercial operators (for upgrading)\n• Registered ECE"
        )
    };
}
