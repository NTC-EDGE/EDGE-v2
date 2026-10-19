using System;
using System.Collections.Generic;
using EDGE.Domain.Enums;

namespace EDGE.Infrastructure.Persistence.SeederData;

public static class RequestsAndComplaintsCategorySeederData
{
    public static readonly Guid CategoryId = Guid.Parse("c0000000-0000-0000-0000-000000000006");
    public static readonly Guid SvcReqBlockingId = Guid.Parse("50000000-0000-0000-0000-000000000081");
    public static readonly Guid SvcReqCompId = Guid.Parse("50000000-0000-0000-0000-000000000080");

    public static readonly string Ntc124Contract = @"
    {
        ""formNo"": ""NTC 1-24"",
        ""revisionNo"": ""02"",
        ""revisionDate"": ""2023-03-31"",
        ""serviceCategory"": ""Requests and Complaints"",
        ""group"": ""Blocking and Unblocking Form"",
        ""applicationTypes"": [""New""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""request_type_and_device_details"", ""required"": true },
            { ""key"": ""sim_details"", ""required"": true },
            { ""key"": ""supporting_documents"", ""required"": false },
            { ""key"": ""incident_and_demographic_info"", ""required"": false }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""action_requested"": [""BLOCK GSM Handset"", ""UNBLOCK GSM Handset""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string Ntc125Contract = @"
    {
        ""formNo"": ""NTC 1-25"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2025-03-31"",
        ""serviceCategory"": ""Requests and Complaints"",
        ""group"": ""Complaint Form"",
        ""applicationTypes"": [""New""],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""particulars_of_service_provider"", ""required"": true },
            { ""key"": ""nature_of_complaint"", ""required"": true },
            { ""key"": ""complaint_details"", ""required"": true }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""notes"": ""THIS FORM IS NOT FOR SALE AND CAN BE REPRODUCED"",
            ""natureOfComplaint"": [""Billing Complaint"", ""Spam"", ""Poor Service (Technical Service/Customer Service)"", ""Scam"", ""Fair Use"", ""Denial of Subscription Plan"", ""Others, please specify""]
        },
        ""entityType"": ""Application""
    }";

    public static readonly string NtcReqComplaintsContract = Ntc125Contract;

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_24"] = Ntc124Contract,
        ["NTC_1_25"] = Ntc125Contract,
        ["NTC_REQ_COMPLAINTS"] = Ntc125Contract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_1_24", SvcReqBlockingId, categoryId, "AFFIDAVIT OF OWNERSHIP AND LOSS WITH UNDERTAKING", "Requests for Blocking and Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone", "NTC_1_24", "AFFIDAVIT OF OWNERSHIP AND LOSS WITH UNDERTAKING (NTC 1-24)", Ntc124Contract),
        new("NTC_1_25", SvcReqCompId, categoryId, "COMPLAINT FORM", "Consumer Complaints and Broadcast Tape Preservation", "NTC_1_25", "COMPLAINT FORM (NTC 1-25)", Ntc125Contract)
    };

    // Variant IDs
    public static readonly Guid VarReqBlocking   = Guid.Parse("60000000-0000-0000-0000-000000000401");
    public static readonly Guid VarReqUnblocking = Guid.Parse("60000000-0000-0000-0000-000000000402");
    public static readonly Guid VarReqSpam       = Guid.Parse("60000000-0000-0000-0000-000000000403");
    public static readonly Guid VarReqProvider   = Guid.Parse("60000000-0000-0000-0000-000000000404");
    public static readonly Guid VarReqTape       = Guid.Parse("60000000-0000-0000-0000-000000000405");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(VarReqBlocking, SvcReqBlockingId, ServiceVariantType.NA, "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(VarReqUnblocking, SvcReqBlockingId, ServiceVariantType.NA, "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"),
        new(VarReqSpam, SvcReqCompId, ServiceVariantType.NA, "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages", false),
        new(VarReqProvider, SvcReqCompId, ServiceVariantType.NA, "Complaints on Services Offered by Telecommunications or Broadcast Service Providers", false),
        new(VarReqTape, SvcReqCompId, ServiceVariantType.NA, "Request for Mandatory Tape Preservation", false)
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
        new("NTC_1_24", Guid.Parse("f2400000-0000-0000-0000-000000000001"), Guid.Parse("f24a0000-0000-0000-0000-000000000000"), new()
        {
            new("request_type_and_device_details", "1. Action Requested & Device Particulars", new() { "action_requested", "make_model_type", "imei_number" }),
            new("sim_details", "2. SIM Card / Mobile Number Details", new() { "mobile_number" }),
            new("supporting_documents", "4. Proof of Ownership & Supporting Documents", new() { "identity_proof_type", "proof_of_ownership_type" }),
            new("incident_and_demographic_info", "Additional Information & Incident Details", new() { "loss_reason", "sex", "age_group", "place_of_incident", "date_of_incident", "time_of_day" })
        }),
        new("NTC_1_25", Guid.Parse("f2500000-0000-0000-0000-000000000001"), Guid.Parse("f25a0000-0000-0000-0000-000000000000"), new()
        {
            new("particulars_of_service_provider", "Particulars of Service Provider", new() { "provider_business_name", "provider_business_address", "provider_contact_number" }),
            new("nature_of_complaint", "Nature of Complaint", new() { "complaint_types", "others_specification", "date_of_incident", "time_of_incident" }),
            new("complaint_details", "Details of Complaint", new() { "state_briefly_details", "attached_proof_documents" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000024"),
            new[] { "Blocking", "Unblocking", "IMEI", "SIM Blocking", "NTC_1_24" },
            "Requests for Blocking / Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone\n\nThe Commission acts on requests for blocking of mobile phone's IMEI (International Mobile Equipment Identity) and SIM (Subscriber Identity Module) due to lost/stolen cellphone units or unblocking of the same.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        ),
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000025"),
            new[] { "Complaints", "Complaint Form", "NTC_1_25", "Spam" },
            "Complaints of Consumers/Subscribers and Broadcast Tape Preservation\n\nThe Commission acts on complaints of consumers/subscribers of telecommunications companies (text scams, spam, illegal/obscene text messages, billing complaints, poor service) and requests for mandatory broadcast tape preservation.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
