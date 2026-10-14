using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class ExamsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000001");
    public static readonly Guid Svc101Id   = Guid.Parse("50000000-0000-0000-0000-000000000001");

    // Variant IDs (Dedicated 05xx range for Exam variants to avoid collision with Certificates 00xx range)
    public static readonly Guid VarRtgFirstTaker    = Guid.Parse("60000000-0000-0000-0000-000000000501");
    public static readonly Guid VarRtgRetaker       = Guid.Parse("60000000-0000-0000-0000-000000000502");
    public static readonly Guid VarRtgUpgrade       = Guid.Parse("60000000-0000-0000-0000-000000000503");

    public static readonly Guid VarRtpFirstTaker    = Guid.Parse("60000000-0000-0000-0000-000000000504");
    public static readonly Guid VarRtpRetaker       = Guid.Parse("60000000-0000-0000-0000-000000000505");
    public static readonly Guid VarRtpUpgrade       = Guid.Parse("60000000-0000-0000-0000-000000000506");

    public static readonly Guid VarAmaFirstTaker    = Guid.Parse("60000000-0000-0000-0000-000000000507");
    public static readonly Guid VarAmaRetaker       = Guid.Parse("60000000-0000-0000-0000-000000000508");
    public static readonly Guid VarAmaUpgrade       = Guid.Parse("60000000-0000-0000-0000-000000000509");

    public static readonly Guid VarRrocAirFirstTaker = Guid.Parse("60000000-0000-0000-0000-000000000510");
    public static readonly Guid VarRrocAirRetaker    = Guid.Parse("60000000-0000-0000-0000-000000000511");

    // Requirement IDs (Dedicated 05xx range for Exam requirements)
    public static readonly Guid ReqAnyId            = Guid.Parse("70000000-0000-0000-0000-000000000501");
    public static readonly Guid ReqTranscript       = Guid.Parse("70000000-0000-0000-0000-000000000502");
    public static readonly Guid ReqPhoto            = Guid.Parse("70000000-0000-0000-0000-000000000503");
    public static readonly Guid ReqRatingProof      = Guid.Parse("70000000-0000-0000-0000-000000000504");
    public static readonly Guid ReqRocValid         = Guid.Parse("70000000-0000-0000-0000-000000000505");
    public static readonly Guid ReqSeminar          = Guid.Parse("70000000-0000-0000-0000-000000000506");
    public static readonly Guid ReqAtRocValid       = Guid.Parse("70000000-0000-0000-0000-000000000507");
    public static readonly Guid ReqPilotLicense     = Guid.Parse("70000000-0000-0000-0000-000000000508");

    public static readonly string Ntc101Contract = @"
    {
        ""formNo"": ""NTC 1-01"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Exams"",
        ""group"": null,
        ""applicationTypes"": [""Radiotelegraphy"", ""Radiotelephony"", ""Amateur"", ""Restricted Radio Operator Certificate - Aircraft""],
        ""examineeTypes"": [""FirstTaker"", ""Retaker"", ""Upgrade""],
        ""elements"": [
            { ""code"": ""1RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For removal"", ""description"": ""For removal , Code (25/20 wpm)"" },
            { ""code"": ""1RTG"", ""condition"": ""For upgrade (2RTG Holder)"", ""description"": ""For upgrade (2RTG Holder) & Code (25/20 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 5, 6 & Code (16 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""For removal"", ""description"": ""For removal, Code (16 wpm)"" },
            { ""code"": ""2RTG"", ""condition"": ""For upgrade (3RTG Holder)"", ""description"": ""For upgrade, (3RTG Holder), Element 6"" },
            { ""code"": ""1PHN"", ""condition"": ""Standard"", ""description"": ""Elements 1, 2, 3 & 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (2PHN Holder)"", ""description"": ""For upgrade (2PHN Holder) , Element 4"" },
            { ""code"": ""1PHN"", ""condition"": ""For upgrade (3PHN Holder)"", ""description"": ""For upgrade (3PHN Holder), Element 3 & 4"" },
            { ""code"": ""Class A"", ""condition"": ""Standard"", ""description"": ""Elements 8, 9, 10 & Code (5 wpm)"" },
            { ""code"": ""Class A"", ""condition"": ""For removal"", ""description"": ""For removal, Code (5 wmp)"" },
            { ""code"": ""Class B"", ""condition"": ""Standard"", ""description"": ""Elements 5, 6 & 7"" },
            { ""code"": ""Class B"", ""condition"": ""For Registered ECE, 1PHN, 1RTG & 2RTG"", ""description"": ""For Registered ECE, 1PHN, 1RTG & 2RTG , Element 2"" },
            { ""code"": ""Class C"", ""condition"": ""Standard"", ""description"": ""Elements 2, 3 & 4"" },
            { ""code"": ""Class C"", ""condition"": ""For Class D Holder"", ""description"": ""For Class D Holder, Elements 3 & 4"" },
            { ""code"": ""Class D"", ""condition"": ""Standard"", ""description"": ""Element 2"" }
        ],
        ""requiredSections"": [
            { ""key"": ""applicantPerson"", ""required"": true },
            { ""key"": ""applicantEducation"", ""required"": false }
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
        // Radiotelegraphy
        new(VarRtgFirstTaker, Svc101Id, ServiceVariantType.FirstTaker, "Radiotelegraphy"),
        new(VarRtgRetaker, Svc101Id, ServiceVariantType.Retaker, "Radiotelegraphy"),
        new(VarRtgUpgrade, Svc101Id, ServiceVariantType.Upgrade, "Radiotelegraphy"),

        // Radiotelephony
        new(VarRtpFirstTaker, Svc101Id, ServiceVariantType.FirstTaker, "Radiotelephony"),
        new(VarRtpRetaker, Svc101Id, ServiceVariantType.Retaker, "Radiotelephony"),
        new(VarRtpUpgrade, Svc101Id, ServiceVariantType.Upgrade, "Radiotelephony"),

        // Amateur
        new(VarAmaFirstTaker, Svc101Id, ServiceVariantType.FirstTaker, "Amateur"),
        new(VarAmaRetaker, Svc101Id, ServiceVariantType.Retaker, "Amateur"),
        new(VarAmaUpgrade, Svc101Id, ServiceVariantType.Upgrade, "Amateur"),

        // Restricted Radio Operator Certificate - Aircraft
        new(VarRrocAirFirstTaker, Svc101Id, ServiceVariantType.FirstTaker, "Restricted Radio Operator Certificate - Aircraft"),
        new(VarRrocAirRetaker, Svc101Id, ServiceVariantType.Retaker, "Restricted Radio Operator Certificate - Aircraft")
    };

    public static List<VariantElementDef> GetBackfillElements()
    {
        var list = new List<VariantElementDef>();

        // Elements for Radiotelegraphy (All 3 variants)
        var rtgVariants = new[] { VarRtgFirstTaker, VarRtgRetaker, VarRtgUpgrade };
        foreach (var vId in rtgVariants)
        {
            list.Add(new(vId, "1RTG", "Elements 1, 2, 5, 6 & Code (25/20 wpm)"));
            list.Add(new(vId, "1RTG", "For removal , Code (25/20 wpm)"));
            list.Add(new(vId, "1RTG", "For upgrade (2RTG Holder) & Code (25/20 wpm)"));
            list.Add(new(vId, "2RTG", "Elements 1, 2, 5, 6 & Code (16 wpm)"));
            list.Add(new(vId, "2RTG", "For removal, Code (16 wpm)"));
            list.Add(new(vId, "2RTG", "For upgrade, (3RTG Holder), Element 6"));
        }

        // Elements for Radiotelephony (All 3 variants)
        var rtpVariants = new[] { VarRtpFirstTaker, VarRtpRetaker, VarRtpUpgrade };
        foreach (var vId in rtpVariants)
        {
            list.Add(new(vId, "1PHN", "Elements 1, 2, 3 & 4"));
            list.Add(new(vId, "1PHN", "For upgrade (2PHN Holder) , Element 4"));
            list.Add(new(vId, "1PHN", "For upgrade (3PHN Holder), Element 3 & 4"));
        }

        // Elements for Amateur (All 3 variants)
        var amaVariants = new[] { VarAmaFirstTaker, VarAmaRetaker, VarAmaUpgrade };
        foreach (var vId in amaVariants)
        {
            list.Add(new(vId, "Class A", "Elements 8, 9, 10 & Code (5 wpm)"));
            list.Add(new(vId, "Class A", "For removal, Code (5 wmp)"));
            list.Add(new(vId, "Class B", "Elements 5, 6 & 7"));
            list.Add(new(vId, "Class B", "For Registered ECE, 1PHN, 1RTG & 2RTG , Element 2"));
            list.Add(new(vId, "Class C", "Elements 2, 3 & 4"));
            list.Add(new(vId, "Class C", "For Class D Holder, Elements 3 & 4"));
            list.Add(new(vId, "Class D", "Element 2"));
        }

        // Elements for Restricted Radio Operator Certificate - Aircraft (Both variants)
        var rrocVariants = new[] { VarRrocAirFirstTaker, VarRrocAirRetaker };
        foreach (var vId in rrocVariants)
        {
            list.Add(new(vId, "Class D", "Element 2"));
        }

        return list;
    }

    public static List<ServiceNoteDef> GetBackfillNotes(Guid svc101)
    {
        const string examNotes = @"1. Examinees shall present this Admission Slip and any valid government issued ID with picture or School ID, for students. (No Admission Slip and ID, No Exam.)
2. Examinees who are late for more than 30 minutes shall not be allowed to take the examination.
3. Request for re-schedule of examination must be filed at least 1 week before the date of examination.
4. In case of suspension/cancellation of work in government offices due to force majeure, the scheduled regular examination shall be conducted on the next regular working day";

        return new()
        {
            new(svc101, null, examNotes),
            new(svc101, VarRtgFirstTaker, examNotes),
            new(svc101, VarRtgRetaker, examNotes),
            new(svc101, VarRtgUpgrade, examNotes),
            new(svc101, VarRtpFirstTaker, examNotes),
            new(svc101, VarRtpRetaker, examNotes),
            new(svc101, VarRtpUpgrade, examNotes),
            new(svc101, VarAmaFirstTaker, examNotes),
            new(svc101, VarAmaRetaker, examNotes),
            new(svc101, VarAmaUpgrade, examNotes),
            new(svc101, VarRrocAirFirstTaker, examNotes),
            new(svc101, VarRrocAirRetaker, examNotes),
        };
    }

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["ANY_ID"] = new(
            ReqAnyId,
            "ANY of the following:*\n• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement",
            "ANY of the following:*\n• Birth Certificate\n• Baptismal Certificate\n• Passport\n• PRC License\n• Driver's License\n• any document which can serve as the basis for age requirement"
        ),
        ["TRANSCRIPT"] = new(
            ReqTranscript,
            "Transcript of Records with Special Order (SO)*",
            "Transcript of Records with Special Order (SO)*\nNote 1: The applicant has to show the original copy.\nNote 2: SO is not required for State Universities/Colleges"
        ),
        ["PHOTO"] = new(
            ReqPhoto,
            "Please provide a clear 1x1 ID picture taken within the last six (6) months.*",
            "Please provide a clear 1x1 ID picture taken within the last six (6) months.*"
        ),
        ["RATING"] = new(
            ReqRatingProof,
            "Proof of Rating*",
            "Proof of Rating*"
        ),
        ["ROC"] = new(
            ReqRocValid,
            "Copy of Valid ROC *",
            "Copy of Valid ROC *"
        ),
        ["SEMINAR"] = new(
            ReqSeminar,
            "Proof of attendance of seminar conducted by NTC accredited Amateur Radio Club*",
            "Proof of attendance of seminar conducted by NTC accredited Amateur Radio Club*"
        ),
        ["AT_ROC"] = new(
            ReqAtRocValid,
            "Copy of Valid AT-ROC *",
            "Copy of Valid AT-ROC *"
        ),
        ["PILOT_LICENSE"] = new(
            ReqPilotLicense,
            "Aircraft pilot's license or student pilot's license issued by the Civil Aviation Authority of the Philippines (CAAP) / Pilot license issued by the aviation authority of the Administration for foreign applicants*",
            "Aircraft pilot's license or student pilot's license issued by the Civil Aviation Authority of the Philippines (CAAP) / Pilot license issued by the aviation authority of the Administration for foreign applicants*"
        ),
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // Radiotelegraphy - FIRST TAKER
        new(VarRtgFirstTaker, ReqAnyId, true),
        new(VarRtgFirstTaker, ReqTranscript, true),
        new(VarRtgFirstTaker, ReqPhoto, true),

        // Radiotelegraphy - RETAKER
        new(VarRtgRetaker, ReqPhoto, true),
        new(VarRtgRetaker, ReqRatingProof, true),

        // Radiotelegraphy - UPGRADE
        new(VarRtgUpgrade, ReqPhoto, true),
        new(VarRtgUpgrade, ReqRocValid, true),

        // Radiotelephony - FIRST TAKER
        new(VarRtpFirstTaker, ReqAnyId, true),
        new(VarRtpFirstTaker, ReqTranscript, true),
        new(VarRtpFirstTaker, ReqPhoto, true),

        // Radiotelephony - RETAKER
        new(VarRtpRetaker, ReqPhoto, true),
        new(VarRtpRetaker, ReqRatingProof, true),

        // Radiotelephony - UPGRADE
        new(VarRtpUpgrade, ReqPhoto, true),
        new(VarRtpUpgrade, ReqRocValid, true),

        // Amateur - FIRST TAKER
        new(VarAmaFirstTaker, ReqAnyId, true),
        new(VarAmaFirstTaker, ReqSeminar, true),
        new(VarAmaFirstTaker, ReqPhoto, true),

        // Amateur - RETAKER
        new(VarAmaRetaker, ReqPhoto, true),
        new(VarAmaRetaker, ReqRatingProof, true),

        // Amateur - UPGRADE
        new(VarAmaUpgrade, ReqPhoto, true),
        new(VarAmaUpgrade, ReqAtRocValid, true),

        // Restricted Radio Operator Certificate - Aircraft - FIRST TAKER
        new(VarRrocAirFirstTaker, ReqPilotLicense, true),
        new(VarRrocAirFirstTaker, ReqPhoto, true),

        // Restricted Radio Operator Certificate - Aircraft - RETAKER
        new(VarRrocAirRetaker, ReqPhoto, true),
        new(VarRrocAirRetaker, ReqRatingProof, true),
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_1_01", Guid.Parse("f0100000-0000-0000-0000-000000000001"), Guid.Parse("f01a0000-0000-0000-0000-000000000000"), new())
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
