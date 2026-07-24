using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-24 (Affidavit of Ownership and Loss with Undertaking).
/// </summary>
public static class Ntc124Fields
{
    public static class ActionRequested
    {
        public static readonly PdfField Block = new("Action.Block", 210.0, 184.0);
        public static readonly PdfField Unblock = new("Action.Unblock", 232.0, 184.0);
    }

    public static class Affiant
    {
        public static readonly PdfField Name = new("Affiant.Name", 110.0, 115.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField Address = new("Affiant.Address", 110.0, 130.0, FontSize: 8.0);
        public static readonly PdfField TelephoneNumber = new("Affiant.TelephoneNumber", 110.0, 145.0, FontSize: 8.0);
        public static readonly PdfField OfficeAddress = new("Affiant.OfficeAddress", 320.0, 145.0, FontSize: 8.0);
        public static readonly PdfField OfficeTelephoneNumber = new("Affiant.OfficeTelephoneNumber", 280.0, 160.0, FontSize: 8.0);
    }

    public static class MobileDetails
    {
        public static readonly PdfField ImeiNo = new("Mobile.ImeiNo", 225.0, 230.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField MakeModelType = new("Mobile.MakeModelType", 225.0, 245.0, FontSize: 8.0);
        public static readonly PdfField SimMobileNumber = new("Mobile.SimMobileNumber", 225.0, 285.0, FontSize: 8.0, IsBold: true);
    }

    public static class ProofOfOwnership
    {
        public static readonly PdfField CopyGovernmentId = new("Proof.CopyGovernmentId", 71.2, 383.0);
        public static readonly PdfField CopySchoolId = new("Proof.CopySchoolId", 71.2, 397.0);
        public static readonly PdfField CopyBirthCertOrNbi = new("Proof.CopyBirthCertOrNbi", 71.2, 413.0);
        public static readonly PdfField ProofOfOwnershipReceipt = new("Proof.ProofOfOwnershipReceipt", 71.2, 452.0);
        public static readonly PdfField BoxWithImei = new("Proof.BoxWithImei", 71.2, 467.0);
        public static readonly PdfField CertificateOfPurchase = new("Proof.CertificateOfPurchase", 71.2, 482.0);
        public static readonly PdfField AffidavitInAbsence = new("Proof.AffidavitInAbsence", 71.2, 497.0);
    }

    public static class Incident
    {
        public static readonly PdfField LostMisplaced = new("Incident.LostMisplaced", 71.2, 537.0);
        public static readonly PdfField Stolen = new("Incident.Stolen", 71.2, 552.0);

        public static readonly PdfField Male = new("Incident.Male", 278.3, 537.0);
        public static readonly PdfField Female = new("Incident.Female", 278.3, 552.0);

        public static readonly PdfField Below18 = new("Incident.Below18", 370.3, 537.0);
        public static readonly PdfField Age18_29 = new("Incident.Age18_29", 439.3, 537.0);
        public static readonly PdfField Age30_39 = new("Incident.Age30_39", 508.3, 537.0);
        public static readonly PdfField Age40_49 = new("Incident.Age40_49", 370.3, 552.0);
        public static readonly PdfField Age50_59 = new("Incident.Age50_59", 439.3, 552.0);
        public static readonly PdfField Age60Up = new("Incident.Age60Up", 508.3, 552.0);

        public static readonly PdfField Daytime = new("Incident.Daytime", 370.3, 581.0);
        public static readonly PdfField Nighttime = new("Incident.Nighttime", 439.3, 581.0);

        public static readonly PdfField PlaceOfIncident = new("Incident.PlaceOfIncident", 180.0, 567.0, FontSize: 8.0);
        public static readonly PdfField DateOfIncident = new("Incident.DateOfIncident", 180.0, 582.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 439.8,
            Y: 657.0,
            Width: 118.6,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class NotaryPublic
    {
        public static readonly PdfField SubscribedDay = new("Notary.SubscribedDay", 275.0, 711.0, FontSize: 8.0);
        public static readonly PdfField SubscribedMonthYear = new("Notary.SubscribedMonthYear", 370.0, 711.0, FontSize: 8.0);
        public static readonly PdfField ResidenceCertNo = new("Notary.ResidenceCertNo", 275.0, 725.0, FontSize: 8.0);
        public static readonly PdfField IssuedAt = new("Notary.IssuedAt", 380.0, 725.0, FontSize: 8.0);
        public static readonly PdfField IssuedDate = new("Notary.IssuedDate", 490.0, 725.0, FontSize: 8.0);

        public static readonly PdfField DocNo = new("Notary.DocNo", 100.0, 745.0, FontSize: 8.0);
        public static readonly PdfField PageNo = new("Notary.PageNo", 100.0, 759.0, FontSize: 8.0);
        public static readonly PdfField BookNo = new("Notary.BookNo", 100.0, 773.0, FontSize: 8.0);
        public static readonly PdfField SeriesOf = new("Notary.SeriesOf", 100.0, 787.0, FontSize: 8.0);
    }
}
