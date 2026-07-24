using System;

namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfApplication118
{
    New,
    Renewal,
    Modification
}

public enum EntityType118
{
    Corporation,
    SingleProprietorship,
    Partnership,
    Others
}

public class PermitCategorySelection
{
    // Radio Communications Equipment (RCE)
    public bool RceCategory { get; set; }
    public bool RceDealer { get; set; }
    public bool RceDealerTransceiver { get; set; }
    public bool RceDealerWdnIndoorSrdRfid { get; set; }
    public bool RceManufacturer { get; set; }
    public bool RceServiceCenter { get; set; }

    // Mobile Phone
    public bool MobilePhoneCategory { get; set; }
    public bool MpDealer { get; set; } // MPDP
    public bool MpRetailerReseller { get; set; } // MPRR
    public bool MpServiceCenter { get; set; } // MPSCP

    // CPE
    public bool CpeSupplierAccreditation { get; set; }
}

public class RequiredPersonnel
{
    public string Name { get; set; } = "";
    public string LicenseNo { get; set; } = ""; // PECE/ECE No. or Certificate/ECT No.
    public DateOnly ValidityDate { get; set; }
}

/// <summary>
/// NTC 1-18 — Application for Dealer/Manufacturer/Service Center/Retailer/Reseller Permit / CPE Supplier Accreditation.
/// Revision No. 02 (03/31/2023).
/// </summary>
public class Ntc118Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public TypeOfApplication118 TypeOfApplication { get; set; } = TypeOfApplication118.New;
    public string? ModificationReason { get; set; }

    public PermitCategorySelection PermitCategory { get; set; } = new();

    public Applicant Applicant { get; set; } = new();
    public EntityType118 EntityType { get; set; } = EntityType118.Corporation;
    public string? EntityTypeOther { get; set; }

    public string? ExistingPermitNo { get; set; }
    public DateOnly ExistingPermitValidity { get; set; }

    public RequiredPersonnel SupervisingEngineer { get; set; } = new();
    public RequiredPersonnel Technician { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
