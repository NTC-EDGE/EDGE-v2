using System;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// Every distinct checkbox on the NTC 1-01 form. The form has 16 individual checkboxes
/// across 4 groups (Radiotelegraphy, Radiotelephony, Amateur, Restricted Radiotelephone) —
/// note this is more granular than the simplified "exam_code" enum in
/// NTC_Forms_JSON_Contract_and_ERD.md section 4.7 (which only lists 1RTG/2RTG/3RTG/etc.,
/// not the "Elements" vs. "Code only" variant within each). Each value here maps to exactly
/// one checkbox on the printed form.
/// </summary>
public enum ExamCode
{
    // RADIOTELEGRAPHY
    Rtg1_Elements1_2_5_6_Code2520Wpm,
    Rtg1_Code2520Wpm,
    Rtg2_Elements1_2_5_6_Code16Wpm,
    Rtg2_Code16Wpm,
    Rtg3_Elements1_2_5_Code16Wpm,
    Rtg3_Code16Wpm,

    // RADIOTELEPHONY
    Phn1_Elements1_2_3_4,
    Phn2_Elements1_2_3,
    Phn3_Elements1_2,

    // AMATEUR
    ClassA_Elements8_9_10_Code5Wpm,
    ClassA_Code5WpmOnly,
    ClassB_Elements5_6_7,
    ClassB_Element2,
    ClassC_Elements2_3_4,
    ClassD_Element2,

    // RESTRICTED RADIOTELEPHONE
    RrocAircraft_Element1
}

public enum Sex
{
    Male,
    Female
}

/// <summary>
/// The examinee's personal details (contract section 4.7's "applicant_person"). This form's
/// applicant is always an individual — there is no company/organization variant, so this does
/// not reuse the generic Applicant model (which carries TypeOfEntity for that purpose).
/// </summary>
public class ApplicantPerson
{
    public string LastName { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string MiddleName { get; set; } = "";
    public DateOnly DateOfBirth { get; set; }
    public Sex Sex { get; set; }
    public string Nationality { get; set; } = "";
    public Address Address { get; set; } = new();
    public string ContactNumber { get; set; } = "";
    public string Email { get; set; } = "";
    public string SchoolAttended { get; set; } = "";
    public string CourseTaken { get; set; } = "";
    public int? YearGraduated { get; set; }
}

/// <summary>Contract section 4.7's "assistance_request" block.</summary>
public class AssistanceRequest
{
    public bool NeedsAssistance { get; set; }
    public string? Details { get; set; }
}

/// <summary>
/// Contract section 4.7's "admission_slip" block — the tear-off section at the bottom of the
/// form. Two mailing-address lines are modeled separately since the printed form has two blank
/// rows for it (a continuation line for longer addresses), not one.
/// </summary>
public class AdmissionSlip
{
    public string ExamineeName { get; set; } = "";
    public string MailingAddressLine1 { get; set; } = "";
    public string? MailingAddressLine2 { get; set; }
    public string ExaminationFor { get; set; } = "";
    public string PlaceOfExam { get; set; } = "";
    public DateOnly DateOfExam { get; set; }
    public string TimeOfExam { get; set; } = "";
    /// <summary>Filled in by NTC staff, not the applicant — usually left blank at submission time.</summary>
    public string? AuthorizedOfficer { get; set; }
}

/// <summary>
/// NTC 1-01 — Application for Radio Operator Examination. This does NOT extend the generic
/// ApplicationBase/Applicant/Equipment shape used by the org-applicant forms (1-11, 1-09, 1-19,
/// etc.) — this form's applicant is an individual sitting an exam, not a company registering
/// equipment, so it has its own applicant/equipment-free shape per contract section 4.7.
/// </summary>
public class Ntc101Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "";
    public DateOnly RevisionDate { get; set; }
    public TypeOfApplication TypeOfApplication { get; set; }

    public ExamCode ExamCode { get; set; }
    public DateOnly DateOfExam { get; set; }

    public ApplicantPerson ApplicantPerson { get; set; } = new();
    public AssistanceRequest AssistanceRequest { get; set; } = new();
    public AdmissionSlip AdmissionSlip { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
