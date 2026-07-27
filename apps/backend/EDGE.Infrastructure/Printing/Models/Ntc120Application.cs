using System;

namespace EDGE.Infrastructure.Printing.Models;

public class RegistrationCategory120
{
    public bool VasProvider { get; set; }
    public bool PcsotspProvider { get; set; }
    public bool VoipProvider { get; set; }
    public bool VoipReseller { get; set; }
}

public class FormerNameInfo
{
    public bool IsKnownByFormerName { get; set; }
    public string? FormerName { get; set; }
}

public class VasServicesSelection
{
    public bool MessagingService { get; set; }
    public bool ContentAndProgramService { get; set; }
    public bool AudioConferencing { get; set; }
    public bool AudiotextService { get; set; }
    public bool AudioAndVideoConferencing { get; set; }
    public bool FacsimileService { get; set; }
    public bool VoiceMailService { get; set; }
    public bool VirtualPrivateNetworkService { get; set; }
    public bool ElectronicMailService { get; set; }
    public bool HostingService { get; set; }
    public bool InformationService { get; set; }
    public bool ElectronicGamingServices { get; set; }
    public bool ApplicationService { get; set; }

    public bool Others { get; set; }
    public string? OthersSpecify { get; set; }
}

/// <summary>
/// NTC 1-20 — Application for Certificate of Registration (VAS / VOIP / PCSOTSP).
/// Revision No. 02 (03/31/2023). Reuses shared models (Applicant, Payment, Declaration, TypeOfApplication, EntityType) from Shared.cs.
/// </summary>
public class Ntc120Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public TypeOfApplication TypeOfApplication { get; set; } = TypeOfApplication.New;
    public string? ModificationReason { get; set; }

    public RegistrationCategory120 RegistrationCategory { get; set; } = new();

    public Applicant Applicant { get; set; } = new();
    public string? EntityTypeOther { get; set; }

    public string? CpcnPaCaNo { get; set; }
    public DateOnly CpcnPaCaValidity { get; set; }

    public string? CorNo { get; set; }
    public DateOnly CorValidity { get; set; }

    public FormerNameInfo FormerNameInfo { get; set; } = new();

    public VasServicesSelection VasServices { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
