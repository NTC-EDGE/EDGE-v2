using System;

namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfCertificate
{
    Rtg1,
    Rtg2,
    Rtg3,
    Phn1,
    Phn2,
    Phn3,
    Srop,
    Rlm,
    RrocAircraft,
    Groc,
    TpRrocAircraft,
    Others
}

public enum EmploymentStatus
{
    Unemployed,
    EmployedLocal,
    EmployedForeign
}

public class ExamSeminarDetails
{
    public string PlaceOfExamSeminar { get; set; } = "";
    public DateOnly Date { get; set; }
    public string Rating { get; set; } = "";
}

public class ApplicantPerson102 : ApplicantPerson
{
    public double? HeightCm { get; set; }
    public double? WeightKg { get; set; }
    public EmploymentStatus EmploymentStatus { get; set; } = EmploymentStatus.Unemployed;
}

/// <summary>
/// NTC 1-02 — Application for Radio Operator Certificate.
/// See JSON contract section 4.1 in FastTrackSeeder.
/// </summary>
public class Ntc102Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);
    public TypeOfApplication TypeOfApplication { get; set; }
    public string? ModificationReason { get; set; }
    public int? NoOfYears { get; set; }

    public TypeOfCertificate TypeOfCertificate { get; set; }
    public string? OtherCertificateDetails { get; set; }

    public ApplicantPerson102 ApplicantPerson { get; set; } = new();
    public ExamSeminarDetails ExamSeminarDetails { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
