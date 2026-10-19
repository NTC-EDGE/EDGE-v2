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
        ""applicationTypes"": [""BLOCK GSM Handset"", ""UNBLOCK GSM Handset""],
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

    public static readonly string NtcReqComplaintsContract = @"
    {
        ""formNo"": ""NTC 1-25 / NTC 1-24"",
        ""revisionNo"": ""03"",
        ""revisionDate"": ""2025-03-31"",
        ""serviceCategory"": ""Requests and Complaints"",
        ""group"": ""Requests and Complaints"",
        ""applicationTypes"": [
            ""Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
            ""Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone"",
            ""Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat/Other Similar Text Messages"",
            ""Complaints on Services Offered by Telecommunications or Broadcast Service Providers"",
            ""Request for Mandatory Tape Preservation""
        ],
        ""elements"": [],
        ""requiredSections"": [
            { ""key"": ""request_type_and_device_details"", ""required"": false },
            { ""key"": ""sim_details"", ""required"": false },
            { ""key"": ""supporting_documents"", ""required"": false },
            { ""key"": ""incident_and_demographic_info"", ""required"": false },
            { ""key"": ""particulars_of_service_provider"", ""required"": false },
            { ""key"": ""nature_of_complaint"", ""required"": false },
            { ""key"": ""complaint_details"", ""required"": false }
        ],
        ""allowsBulkSubmission"": false,
        ""categorySpecific"": {
            ""notes"": ""THIS FORM IS NOT FOR SALE AND CAN BE REPRODUCED"",
            ""action_requested"": [""BLOCK GSM Handset"", ""UNBLOCK GSM Handset""],
            ""natureOfComplaint"": [""Billing Complaint"", ""Spam"", ""Poor Service (Technical Service/Customer Service)"", ""Scam"", ""Fair Use"", ""Denial of Subscription Plan"", ""Others, please specify""]
        },
        ""entityType"": ""Application""
    }";

    public static Dictionary<string, string> GetContractMapEntries() => new(StringComparer.OrdinalIgnoreCase)
    {
        ["NTC_1_24"] = Ntc124Contract,
        ["NTC_1_25"] = Ntc125Contract,
        ["NTC_REQ_COMPLAINTS"] = NtcReqComplaintsContract
    };

    public static List<ServiceCategoryDef> GetServiceDefs(Guid categoryId) => new()
    {
        new("NTC_REQ_COMPLAINTS", SvcReqCompId, categoryId, "Requests and Complaints of Consumers/Subscribers", "Requests and Complaints", "NTC_REQ_COMPLAINTS", "Requests and Complaints of Consumers/Subscribers (Blocking/Unblocking of IMEI and SIM, Text Spam/Scam Complaints, Telco/Broadcast Service Complaints, Tape Preservation)", NtcReqComplaintsContract)
    };

    // Variant IDs
    public static readonly Guid VarReqBlocking   = Guid.Parse("60000000-0000-0000-0000-000000000401");
    public static readonly Guid VarReqUnblocking = Guid.Parse("60000000-0000-0000-0000-000000000402");
    public static readonly Guid VarReqSpam       = Guid.Parse("60000000-0000-0000-0000-000000000403");
    public static readonly Guid VarReqProvider   = Guid.Parse("60000000-0000-0000-0000-000000000404");
    public static readonly Guid VarReqTape       = Guid.Parse("60000000-0000-0000-0000-000000000405");

    public static List<ServiceVariantDef> GetVariantDefs() => new()
    {
        new(VarReqBlocking, SvcReqCompId, ServiceVariantType.NA, "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone", false),
        new(VarReqUnblocking, SvcReqCompId, ServiceVariantType.NA, "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone", false),
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
        new("NTC_REQ_COMPLAINTS", Guid.Parse("f2500000-0000-0000-0000-000000000001"), Guid.Parse("f25a0000-0000-0000-0000-000000000000"), new()
        {
            // Sections for Blocking & Unblocking (NTC 1-24)
            new("request_type_and_device_details", "1. Action Requested & Device Particulars", new() { "action_requested", "device_particulars" }),
            new("sim_details", "2. SIM Card / Mobile Number Details", new() { "sim_mobile_numbers" }),
            new("supporting_documents", "4. Proof of Ownership & Supporting Documents", new() { "identity_proof_type", "proof_of_ownership_type" }),
            new("incident_and_demographic_info", "Additional Information & Incident Details", new() { "loss_reason", "sex", "age_group", "place_of_incident", "date_of_incident", "time_of_day" }),

            // Sections for Complaints & Tape Preservation (NTC 1-25)
            new("particulars_of_service_provider", "Particulars of Service Provider", new() { "provider_business_name", "provider_business_address", "provider_contact_number" }),
            new("nature_of_complaint", "Nature of Complaint", new() { "complaint_types", "others_specification", "date_of_incident", "time_of_incident" }),
            new("complaint_details", "Details of Complaint", new() { "state_briefly_details", "attached_proof_documents" })
        }),
        new("NTC_1_24", Guid.Parse("f2400000-0000-0000-0000-000000000001"), Guid.Parse("f24a0000-0000-0000-0000-000000000000"), new()
        {
            new("request_type_and_device_details", "1. Action Requested & Device Particulars", new() { "action_requested", "device_particulars" }),
            new("sim_details", "2. SIM Card / Mobile Number Details", new() { "sim_mobile_numbers" }),
            new("supporting_documents", "4. Proof of Ownership & Supporting Documents", new() { "identity_proof_type", "proof_of_ownership_type" }),
            new("incident_and_demographic_info", "Additional Information & Incident Details", new() { "loss_reason", "sex", "age_group", "place_of_incident", "date_of_incident", "time_of_day" })
        }),
        new("NTC_1_25", Guid.Parse("f2500000-0000-0000-0000-000000000002"), Guid.Parse("f25a0000-0000-0000-0000-000000000000"), new()
        {
            new("particulars_of_service_provider", "Particulars of Service Provider", new() { "provider_business_name", "provider_business_address", "provider_contact_number" }),
            new("nature_of_complaint", "Nature of Complaint", new() { "complaint_types", "others_specification", "date_of_incident", "time_of_incident" }),
            new("complaint_details", "Details of Complaint", new() { "state_briefly_details", "attached_proof_documents" })
        })
    };

    public static List<ServiceInformationDef> GetServiceInformations() => new()
    {
        new(
            Guid.Parse("a1000000-0000-0000-0000-000000000025"),
            new[] { "Requests and Complaints of Consumers/Subscribers", "Requests and Complaints", "Blocking", "Unblocking", "IMEI", "SIM", "Complaints", "Spam", "Scam", "Tape Preservation", "NTC_REQ_COMPLAINTS" },
            "Requests and Complaints of Consumers/Subscribers\n\nThe Commission acts on requests for blocking/unblocking of mobile phone's IMEI and SIM due to lost/stolen cellphone units, complaints of consumers/subscribers against telecommunications service providers (text scams, spam, illegal/obscene text messages, billing complaints, poor service), and requests for mandatory broadcast tape preservation.",
            "WHO MAY AVAIL:\n\n1. Individuals\n2. Private and Government Entities"
        )
    };
}
