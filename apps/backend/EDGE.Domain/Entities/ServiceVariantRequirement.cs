using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

/// <summary>
/// Maps a master Requirement to a specific ServiceVariant, optionally scoped
/// to a per-applicant context (e.g., "Radiotelegraphy|Re-taker", "CommercialROC").
/// ContextKey is a pipe-delimited composite of form field values defined by
/// requirementDiscriminatorFields in the Service.Contract JSON.
/// A null ContextKey acts as a catch-all rule applying to all applicants of that variant.
/// </summary>
public class ServiceVariantRequirement : AuditableEntity
{
    public Guid RequirementId { get; set; }
    public Requirement? Requirement { get; set; }

    public Guid ServiceVariantId { get; set; }
    public ServiceVariant? ServiceVariant { get; set; }

    /// <summary>
    /// Pipe-delimited composite discriminator resolved from the applicant's FormFieldValues.
    /// Examples: "Radiotelegraphy|Re-taker", "CommercialROC", null (catch-all).
    /// </summary>
    public string? ContextKey { get; set; }

    public bool IsRequired { get; set; } = true;
}
