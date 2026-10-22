using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

/// <summary>
/// Represents the application-level variant type (i.e., the type of application being submitted).
/// These map to ServiceVariant rows in the database.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ServiceVariantType
{
    New,
    Renewal,
    Modification,
    Retaker,
    FirstTaker,
    Upgrade,
    NA,
    
    // Permit applicant/entity sub-types as variants
    VSAT,
    Private,
    CivicActionGroup,
    Government
}
