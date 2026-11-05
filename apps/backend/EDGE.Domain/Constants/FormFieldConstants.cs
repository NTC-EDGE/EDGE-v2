using System;
using System.Collections.Generic;

namespace EDGE.Domain.Constants;

/// <summary>
/// Deterministic GUID constants for dynamic service variant element and station class form fields.
/// 
/// Note: Applicant personal information (Name, Date of Birth, Address, Contact Number,
/// Education, E-Signature, etc.) is NOT a form field. It is persisted directly in the strongly-typed
/// Applicant and ApplicantDetail database entities.
/// </summary>
public static class FormFieldConstants
{
    // ── Dynamic Form Fields for Variant Elements & Station Class ─────────────
    public static readonly Guid ExamElements   = Guid.Parse("fd000000-0000-0000-0000-000000000009");
    public static readonly Guid ClassOfStation = Guid.Parse("fd000000-0000-0000-0000-000000000025");
    public static readonly Guid StationClass   = Guid.Parse("fd000000-0000-0000-0000-000000000101");

    /// <summary>
    /// Standard form field GUIDs that identify service variant elements or station classes.
    /// </summary>
    public static readonly HashSet<Guid> ElementFieldIds = new()
    {
        ExamElements,
        ClassOfStation,
        StationClass
    };
}
