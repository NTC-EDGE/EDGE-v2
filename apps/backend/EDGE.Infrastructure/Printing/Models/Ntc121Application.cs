using System;

namespace EDGE.Infrastructure.Printing.Models;

/// <summary>
/// NTC 1-21 — Application for Duplicate of Permit/License/Certificate.
/// Revision No. 02 (03/31/2023).
/// </summary>
public class Ntc121Application
{
    public Guid ApplicationId { get; set; }
    public string RevisionNo { get; set; } = "02";
    public DateOnly RevisionDate { get; set; } = new DateOnly(2023, 3, 31);

    public ApplicantPerson ApplicantPerson { get; set; } = new();

    public string CircumstancesOfLossMutilation { get; set; } = "";

    public string PermitLicenseCertType { get; set; } = "";
    public string PermitLicenseCertNo { get; set; } = "";
    public DateOnly PermitLicenseCertValidity { get; set; }

    public Payment? Payment { get; set; }
    public Declaration Declaration { get; set; } = new();
}
