using System;
using System.Collections.Generic;

namespace EDGE.Infrastructure.Printing.Models;

public enum TypeOfPermitLicenseCert103
{
    AmateurRadioOperatorCertificate,
    AmateurRadioStationLicense,
    ClubRadioStationLicense,
    TemporaryPermitForeignVisitor,
    SpecialPermitVanityCallSign
}

public enum ClassOfStationAmateur
{
    ClassA,
    ClassB,
    ClassC,
    ClassD
}

/// <summary>
/// NTC 1-03 — Application for Amateur Radio Operator Certificate / Amateur Radio Station License.
/// See JSON contract section 4.2 in FastTrackSeeder.
/// </summary>
public class Ntc103Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);
    public TypeOfApplication TypeOfApplication { get; set; }
    public string? ModificationReason { get; set; }
    public int? NoOfYears { get; set; }

    public TypeOfPermitLicenseCert103 TypeOfPermitLicenseCert { get; set; }
    public ClassOfStationAmateur ClassOfStation { get; set; } = ClassOfStationAmateur.ClassA;

    public string? NameOfClub { get; set; }
    public string? AssignedFreq { get; set; }
    public string? PreferredCallSigns { get; set; }

    public ApplicantPerson ApplicantPerson { get; set; } = new();

    public string CallSign { get; set; } = "";
    public string AtrocArslNo { get; set; } = "";
    public DateOnly Validity { get; set; }

    public ExamSeminarDetails ExamSeminarDetails { get; set; } = new();
    public List<Equipment> Equipment { get; set; } = new();

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
