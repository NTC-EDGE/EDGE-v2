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
        new("NTC_REQ_COMPLAINTS", SvcReqCompId, categoryId, "REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS", "Requests and Complaints of Consumers/Subscribers", "NTC_REQ_COMPLAINTS", "REQUESTS AND COMPLAINTS OF CONSUMERS/SUBSCRIBERS", NtcReqComplaintsContract)
    };

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(Guid.Parse("60000000-0000-0000-0000-000000000401"), SvcReqCompId, ServiceVariantType.New, "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000402"), SvcReqCompId, ServiceVariantType.New, "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000403"), SvcReqCompId, ServiceVariantType.New, "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000404"), SvcReqCompId, ServiceVariantType.New, "Complaints on Services Offered by Telecommunications or Broadcast Service Providers"),
        new(Guid.Parse("60000000-0000-0000-0000-000000000405"), SvcReqCompId, ServiceVariantType.New, "Request for Mandatory Tape Preservation")
    };

    public static Dictionary<string, RequirementDef> GetBackfillRequirements() => new()
    {
        ["REQ_PROOF_OF_OWNERSHIP"] = new(Guid.Parse("70000000-0000-0000-0000-000000000401"), "Proof of Ownership of Mobile Phone (Receipt / Box / Police Report / Notarized Affidavit)", "Proof of ownership document such as official receipt, box with IMEI barcode, police report, or notarized affidavit of loss."),
        ["REQ_VALID_ID_STUDENT_PASSPORT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000402"), "Valid ID (Government ID / Passport / School ID)", "Any government-issued ID, student ID with registration, or passport with signature."),
        ["REQ_BLOCKING_FORM_PROOF"] = new(Guid.Parse("70000000-0000-0000-0000-000000000403"), "Duly Accomplished Incident Report / Form & Proof of Identity", "Duly accomplished unblocking form and previously issued blocking acknowledgment or unit ownership proof."),
        ["REQ_VALID_ID_SIMPLE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000404"), "Valid ID of the Applicant / Subscriber", "Any valid government or institutional identification document."),
        ["REQ_SCREENSHOT_TEXT_MSG"] = new(Guid.Parse("70000000-0000-0000-0000-000000000405"), "Screenshot / Copy of the Unwanted / Threat Text Message", "Clear screenshot, photo, or transcribed copy showing the sender number, date, time, and text message body."),
        ["REQ_NOTARIZED_COMPLAINT"] = new(Guid.Parse("70000000-0000-0000-0000-000000000406"), "Duly Accomplished and Notarized Complaint Form (for Administrative Case)", "Formal notarized complaint with verification and certification against forum shopping (if filing administrative case)."),
        ["REQ_TELCO_SERVICE_DOCS"] = new(Guid.Parse("70000000-0000-0000-0000-000000000407"), "Statement of Account / Billing Statement / Telco Subscription Documents", "Copy of relevant billing statement, proof of subscription, or previous communication/ticket with the service provider."),
        ["REQ_LETTER_REQUEST_MANDATORY_TAPE"] = new(Guid.Parse("70000000-0000-0000-0000-000000000408"), "Formal Letter Request / Legal Instrument Specifying Subject Broadcast Details", "Letter-request from court, law enforcement, lawyer, or affected individual detailing station name, frequency, date, time, and title of program.")
    };

    public static List<VariantRequirementDef> GetBackfillVariantRequirements() => new()
    {
        // 1. Blocking of IMEI/SIM
        new(Guid.Parse("60000000-0000-0000-0000-000000000401"), Guid.Parse("70000000-0000-0000-0000-000000000401"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000401"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true),

        // 2. Unblocking of IMEI/SIM
        new(Guid.Parse("60000000-0000-0000-0000-000000000402"), Guid.Parse("70000000-0000-0000-0000-000000000403"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000402"), Guid.Parse("70000000-0000-0000-0000-000000000404"), true),

        // 3. Spam / Scam Complaints
        new(Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000405"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000403"), Guid.Parse("70000000-0000-0000-0000-000000000406"), false),

        // 4. Telco / Broadcast Provider Complaints
        new(Guid.Parse("60000000-0000-0000-0000-000000000404"), Guid.Parse("70000000-0000-0000-0000-000000000402"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000407"), Guid.Parse("70000000-0000-0000-0000-000000000407"), true),
        new(Guid.Parse("60000000-0000-0000-0000-000000000404"), Guid.Parse("70000000-0000-0000-0000-000000000406"), false),

        // 5. Tape Preservation
        new(Guid.Parse("60000000-0000-0000-0000-000000000405"), Guid.Parse("70000000-0000-0000-0000-000000000408"), true)
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
