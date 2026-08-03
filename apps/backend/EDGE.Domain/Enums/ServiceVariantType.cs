using System.Text.Json.Serialization;

namespace EDGE.Domain.Enums;

/// <summary>
/// Represents the application-level variant type (i.e., the type of application being submitted).
/// These map to ServiceVariant rows in the database and are shared across all applicants
/// in a single application submission.
/// Note: Applicant-level distinctions such as ExamineeType (First Taker, Re-taker, Upgrade)
/// are captured per-applicant in FormFieldValues and resolved as ContextKey during
/// requirement validation — they are NOT ServiceVariant types.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ServiceVariantType
{
    New,
    Renewal,
    Modification,
    Retaker,
    FirstTaker,
    Upgrade
}
