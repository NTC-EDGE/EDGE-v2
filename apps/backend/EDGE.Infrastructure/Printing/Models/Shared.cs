namespace EDGE.Infrastructure.Printing.Models;

// ---------------------------------------------------------------------------
// Shared sub-schemas — mirror NTC_Forms_JSON_Contract_and_ERD.md section 3.
// These are the blocks reused across all 10 form types, so the PDF renderer
// (Reports/FormDocument.cs) can build itself out of the same components
// regardless of which form is being printed.
// ---------------------------------------------------------------------------

public class Address
{
    public string UnitRoomBldgNo { get; set; } = "";
    public string Street { get; set; } = "";
    public string Barangay { get; set; } = "";
    public string CityMunicipality { get; set; } = "";
    public string Province { get; set; } = "";
    public string ZipCode { get; set; } = "";

    public string ToSingleLine() =>
        string.Join(", ", new[] { UnitRoomBldgNo, Street, Barangay, CityMunicipality, Province, ZipCode }
            .Where(s => !string.IsNullOrWhiteSpace(s)));
}

public enum EntityType
{
    Corporation,
    Partnership,
    SingleProprietorship,
    Other
}

public class Applicant
{
    public Guid ApplicantId { get; set; }
    public string Name { get; set; } = "";
    public EntityType TypeOfEntity { get; set; }
    public Address Address { get; set; } = new();
    public string ContactNumber { get; set; } = "";
    public string Email { get; set; } = "";
}

public class Equipment
{
    public Guid EquipmentId { get; set; }
    public Guid ApplicationId { get; set; }
    public string RadioEquipment { get; set; } = "";
    public string Make { get; set; } = "";
    public string TypeModel { get; set; } = "";
    public string SerialNumber { get; set; } = "";
    public string PowerOutput { get; set; } = "";
    public string FrequencyRange { get; set; } = "";
    public int Quantity { get; set; }
}

public class Antenna
{
    public Guid AntennaId { get; set; }
    public Guid StationId { get; set; }
    public string Type { get; set; } = "";
    public double HeightM { get; set; }
    public double GainDbi { get; set; }
    public double DirectivityDegrees { get; set; }
    public string Diameter { get; set; } = "";
    public string Polarization { get; set; } = "";
    public double BeamwidthDegrees { get; set; }
}

public class Station
{
    public Guid StationId { get; set; }
    public Guid ApplicationId { get; set; }
    public string ExactLocation { get; set; } = "";
    public string Longitude { get; set; } = "";
    public string Latitude { get; set; } = "";
    public string PointsOfCommServiceArea { get; set; } = "";
    public string AssignedFreq { get; set; } = "";
    public string BwEmission { get; set; } = "";
    public string Configuration { get; set; } = "";
    public string DataRate { get; set; } = "";
    public string ServiceArea { get; set; } = "";
    public string CallSign { get; set; } = "";
    public string RslNo { get; set; } = "";
    public DateOnly Validity { get; set; }
    public string Others { get; set; } = "";

    // A station can carry its own antenna spec (NTC 1-10 / 1-11).
    public Antenna? Antenna { get; set; }
}

public class Payment
{
    public Guid PaymentId { get; set; }
    public Guid ApplicationId { get; set; }
    public string OrNo { get; set; } = "";
    public DateOnly OrDate { get; set; }
    public decimal Amount { get; set; }
    public string CollectingOfficer { get; set; } = "";
}

public class Declaration
{
    public string SignatoryName { get; set; } = "";
    public DateOnly DateAccomplished { get; set; }
}

public enum TypeOfApplication
{
    New,
    Renewal,
    Modification
}

/// <summary>
/// Base envelope every form extends — see JSON contract section 3.8.
/// Form-specific DTOs (e.g. ConstructionPermitApplication) inherit this
/// and add their own fields on top.
/// </summary>
public abstract class ApplicationBase
{
    public Guid ApplicationId { get; set; }
    public string FormNo { get; set; } = "";
    public string RevisionNo { get; set; } = "";
    public DateOnly RevisionDate { get; set; }
    public string FormType { get; set; } = "";
    public TypeOfApplication TypeOfApplication { get; set; }
    public string? ModificationReason { get; set; }
    public int? NoOfYears { get; set; }

    public Applicant Applicant { get; set; } = new();
    public List<Equipment> Equipment { get; set; } = new();
    public List<Station> Stations { get; set; } = new();
    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}

public class ClassOfStation
{
    public int RT { get; set; }
    public int FX { get; set; }
    public int FB { get; set; }
    public int ML { get; set; }
    public int P { get; set; }
    public int BC { get; set; }
    public int FC { get; set; }
    public int FA { get; set; }
    public int MA { get; set; }
    public int TC { get; set; }
    public string? Other { get; set; }
}