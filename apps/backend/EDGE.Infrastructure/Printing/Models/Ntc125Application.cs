using System;
using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

public class ComplainantDetails
{
    public string Name { get; set; } = "";
    public string Sex { get; set; } = "";
    public string CivilStatus { get; set; } = "";
    public string Nationality { get; set; } = "Filipino";
    public Address ResidentialAddress { get; set; } = new();
    public string ContactNumber { get; set; } = "";
    public string Email { get; set; } = "";
}

public class ServiceProviderDetails
{
    public string BusinessName { get; set; } = "";
    public string BusinessAddress { get; set; } = "";
    public string ContactNumber { get; set; } = "";
}

public class NatureOfComplaintDetails
{
    public List<string> ComplaintTypes { get; set; } = new();
    public string OthersSpecification { get; set; } = "";
    public DateOnly? DateOfIncident { get; set; }
    public string TimeOfIncident { get; set; } = "";
}

public class AttachedProofDocument
{
    public string DocumentDescription { get; set; } = "";
    public string AttachmentFileName { get; set; } = "";
}

/// <summary>
/// NTC 1-25 — Complaint Form (Consumer Welfare & Subscriber Complaints).
/// Revision No. 03 (03/31/2025).
/// </summary>
public class Ntc125Application
{
    public Guid ApplicationId { get; set; }
    public string ApplicationNumber { get; set; } = "";
    public string ReferenceNumber { get; set; } = "";
    public string FormNo { get; set; } = "NTC 1-25";
    public string RevisionNo { get; set; } = "03";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2025, 3, 31);

    public ComplainantDetails Complainant { get; set; } = new();
    public ServiceProviderDetails ServiceProvider { get; set; } = new();
    public NatureOfComplaintDetails NatureOfComplaint { get; set; } = new();
    public string StateBrieflyDetails { get; set; } = "";
    public List<AttachedProofDocument> AttachedProofDocuments { get; set; } = new();

    public Declaration Declaration { get; set; } = new();
}
