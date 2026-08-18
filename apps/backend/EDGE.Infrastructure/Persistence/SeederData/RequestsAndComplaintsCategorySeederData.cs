using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class RequestsAndComplaintsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000006");
    public static readonly Guid SvcReqCompId = Guid.Parse("50000000-0000-0000-0000-000000000080");

    public static readonly string NtcReqComplaintsContract = @"
    {
        ""formNo"": ""NTC-REQ-COMPLAINTS"",
        ""revisionNo"": ""01"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Requests and Complaints"",
        ""group"": ""Requests and Complaints of Consumers/Subscribers"",
        ""applicationTypes"": [""New""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""applicant"", ""required"": true },
            { ""key"": ""details"", ""required"": true },
            { ""key"": ""declaration"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""requestType"": [""IMEI/SIM Blocking"", ""IMEI/SIM Unblocking"", ""Spam/Scam Text Complaints"", ""Telco/Broadcast Complaints"", ""Mandatory Tape Preservation""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_REQ_COMPLAINTS"] = NtcReqComplaintsContract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_REQ_COMPLAINTS", SvcReqCompId, categoryId, "Requests and Complaints of Consumers/Subscribers", "Requests and Complaints of Consumers/Subscribers", "NTC_REQ_COMPLAINTS", "Requests and Complaints of Consumers/Subscribers", NtcReqComplaintsContract)
    };

    // Variant IDs
    public static readonly Guid VarReqBlocking   = Guid.Parse("60000000-0000-0000-0000-000000000401");
    public static readonly Guid VarReqUnblocking = Guid.Parse("60000000-0000-0000-0000-000000000402");
    public static readonly Guid VarReqSpam       = Guid.Parse("60000000-0000-0000-0000-000000000403");
    public static readonly Guid VarReqProvider   = Guid.Parse("60000000-0000-0000-0000-000000000404");
    public static readonly Guid VarReqTape       = Guid.Parse("60000000-0000-0000-0000-000000000405");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(VarReqBlocking, SvcReqCompId, ServiceVariantType.NA, "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(VarReqUnblocking, SvcReqCompId, ServiceVariantType.NA, "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(VarReqSpam, SvcReqCompId, ServiceVariantType.NA, "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"),
        new(VarReqProvider, SvcReqCompId, ServiceVariantType.NA, "Complaints on Services Offered by Telecommunications or Broadcast Service Providers"),
        new(VarReqTape, SvcReqCompId, ServiceVariantType.NA, "Request for Mandatory Tape Preservation")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["PROOF_OF_OWNERSHIP_BLOCKING"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000401"),
            "Proof of ownership, ANY of the following:",
            "1. Proof of ownership, ANY of the following:*\n• Official Receipt of the mobile phone\n• Box of the mobile phone with International Mobile Equipment Identity (IMEI)\n• Police Blotter"
        ),
        ["VALID_IDENTIFICATION_BLOCKING"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000402"),
            "Copy of valid Identification",
            "Copy of valid Identification*\n• Any government-issued ID OR Passport\n• For students, School ID\n• For cases when ID is not available, Birth Certificate OR NBI Clearance"
        ),
        ["UNBLOCKING_PROOF"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000403"),
            "ANY of the following:\n• Blocking Form\n• Proof of Blocking",
            "1. ANY of the following:*\n• Blocking Form\n• Proof of Blocking"
        ),
        ["VALID_ID_UNBLOCKING"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000404"),
            "Valid ID",
            "2. Valid ID*"
        ),
        ["SCREENSHOT_TEXT_MESSAGE"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000405"),
            "Screenshot of text message",
            "2. Screenshot of text message*"
        ),
        ["NOTARIZED_COMPLAINT"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000406"),
            "If complaint proceeds to administrative case:\nCopy of duly notarized Complaint",
            "If complaint proceeds to administrative case:\nCopy of duly notarized Complaint"
        ),
        ["TELCO_SERVICE_DOCS"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000407"),
            "ANY of the following:\n• Service Contract\n• Billing Statement\n• Document indicating services availed by the complainant",
            "2. ANY of the following:*\n• Service Contract\n• Billing Statement\n• Document indicating services availed by the complainant"
        ),
        ["LETTER_REQUEST_TAPE"] = new(
            Guid.Parse("70000000-0000-0000-0000-000000000408"),
            "Letter Request",
            "1. Letter Request*"
        )
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone
        new(VarReqBlocking, Guid.Parse("70000000-0000-0000-0000-000000000401"), true),
        new(VarReqBlocking, Guid.Parse("70000000-0000-0000-0000-000000000402"), true),

        // 2. Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone
        new(VarReqUnblocking, Guid.Parse("70000000-0000-0000-0000-000000000403"), true),
        new(VarReqUnblocking, Guid.Parse("70000000-0000-0000-0000-000000000404"), true),

        // 3. Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages
        new(VarReqSpam, Guid.Parse("70000000-0000-0000-0000-000000000402"), true),
        new(VarReqSpam, Guid.Parse("70000000-0000-0000-0000-000000000405"), true),
        new(VarReqSpam, Guid.Parse("70000000-0000-0000-0000-000000000406"), false),

        // 4. Complaints on Services Offered by Telecommunications or Broadcast Service Providers
        new(VarReqProvider, Guid.Parse("70000000-0000-0000-0000-000000000402"), true),
        new(VarReqProvider, Guid.Parse("70000000-0000-0000-0000-000000000407"), true),
        new(VarReqProvider, Guid.Parse("70000000-0000-0000-0000-000000000406"), false),

        // 5. Request for Mandatory Tape Preservation
        new(VarReqTape, Guid.Parse("70000000-0000-0000-0000-000000000408"), true)
    };

    public static List<ServiceFormDef> GetFormDefs() => new()
    {
        new("NTC_REQ_COMPLAINTS", Guid.Parse("f8000000-0000-0000-0000-000000000001"), Guid.Parse("f80a0000-0000-0000-0000-000000000000"), new()
        {
            new("applicant", "Applicant Details", new() { "fullName", "address", "contactNo", "email" }),
            new("details", "Details of Request or Complaint", new() { "circumstances" }),
            new("declaration", "Declaration", new() { "signatureField", "declarationCheckbox" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000024"),
            new[] { "Requests and Complaints", "IMEI", "SIM Blocking" },
            "Requests and Complaints of Consumers/Subscribers\n\nThe Commission acts on:\n\n(a) requests for blocking of mobile phone's IMEI (International Mobile Equipment Identity) and SIM (Subscriber Identity Module) due to lost/stolen cellphone units or unblocking of the same;\n\n(b) complaints of consumers/subscribers of telecommunications companies such as text scams, unwanted calls/texts and illegal/obscene/threat/other similar text messages; and\n\n(c) complaints of consumers/subscribers of telecommunications or broadcast Service Providers (i.e. Cable TV, DTH, etc.) such as billing complaint, poor customer service, poor technical service and fair usage issues.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
