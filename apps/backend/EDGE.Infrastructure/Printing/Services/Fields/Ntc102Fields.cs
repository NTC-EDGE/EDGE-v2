using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-02 (Application for Radio Operator License).
/// </summary>
public static class Ntc102Fields
{
    public static class TypeOfApplication
    {
        public const double AppTypeColX = 70;
        public static readonly PdfField New = new("TypeOfApplication.New", AppTypeColX, 287);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", AppTypeColX, 302);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", AppTypeColX, 317);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 88.0, 333.0, FontSize: 8.0);
        public static readonly PdfField NoOfYears = new(
            "TypeOfApplication.NoOfYears",
            X: 121.53,
            Y: 363,
            Width: 25.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class TypeOfCertificate
    {
        public const double AppTypeCol1X = 293;
        public const double AppTypeCol2X = 392;
        public static readonly PdfField Rtg1 = new("TypeOfCertificate.Rtg1", AppTypeCol1X, 287);
        public static readonly PdfField Rtg2 = new("TypeOfCertificate.Rtg2", AppTypeCol1X, 302);
        public static readonly PdfField Rtg3 = new("TypeOfCertificate.Rtg3", AppTypeCol1X, 317);
        public static readonly PdfField Phn1 = new("TypeOfCertificate.Phn1", AppTypeCol1X, 333);
        public static readonly PdfField Phn2 = new("TypeOfCertificate.Phn2", AppTypeCol1X, 347);
        public static readonly PdfField Phn3 = new("TypeOfCertificate.Phn3", AppTypeCol1X, 363);

        public static readonly PdfField Srop = new("TypeOfCertificate.Srop", AppTypeCol2X, 287);
        public static readonly PdfField Rlm = new("TypeOfCertificate.Rlm", AppTypeCol2X, 302);
        public static readonly PdfField RrocAircraft = new("TypeOfCertificate.RrocAircraft", AppTypeCol2X, 317);
        public static readonly PdfField Groc = new("TypeOfCertificate.Groc", AppTypeCol2X, 333);
        public static readonly PdfField TpRrocAircraft = new("TypeOfCertificate.TpRrocAircraft", AppTypeCol2X, 347);
        public static readonly PdfField Others = new("TypeOfCertificate.Others", AppTypeCol2X, 363);
        public static readonly PdfField OtherCertificateDetails = new("TypeOfCertificate.OtherDetails", 410.0, 377.0, FontSize: 8.0);
    }

    public static class Applicant
    {
        public const double ApplicantCol1X = 88;
        public const double ApplicantCol2X = 138;
        public const double ApplicantCol3X = 386;
        public static readonly PdfField LastName = new("Applicant.LastName", ApplicantCol1X, 422.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField DateOfBirth = new("Applicant.DateOfBirth", ApplicantCol2X, 422.0, FontSize: 8.0);

        public static readonly PdfField FirstName = new("Applicant.FirstName", ApplicantCol1X, 437.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField HeightCm = new("Applicant.HeightCm", 410.0, 437.0, FontSize: 8.0);
        public static readonly PdfField WeightKg = new("Applicant.WeightKg", 534.0, 437.0, FontSize: 8.0);

        public static readonly PdfField MiddleName = new("Applicant.MiddleName", ApplicantCol1X, 452.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField SexMale = new("Applicant.SexMale", 109.13, 465);
        public static readonly PdfField SexFemale = new("Applicant.SexFemale", 208.36, 465);

        public static readonly PdfField Unemployed = new("Applicant.Unemployed", 400, 445);
        public static readonly PdfField Employed = new("Applicant.Employed", 493.68, 450);
        public static readonly PdfField EmployedLocal = new("Applicant.EmployedLocal", 415, 465.0);
        public static readonly PdfField EmployedForeign = new("Applicant.EmployedForeign", 415, 478.33);

        public static readonly PdfField Nationality = new("Applicant.Nationality", ApplicantCol1X, 482.0, FontSize: 8.0);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", ApplicantCol2X, 497.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", ApplicantCol3X, 497.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", ApplicantCol2X, 512.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", ApplicantCol3X, 512.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", ApplicantCol2X, 527.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", ApplicantCol3X, 527.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", ApplicantCol2X, 542.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", ApplicantCol3X, 542.0, FontSize: 8.0);
    }

    public static class ExamSeminarDetails
    {
        public static readonly PdfField PlaceOfExamSeminar = new("ExamSeminar.Place", 138.0, 572.0, FontSize: 8.0);
        public static readonly PdfField Date = new("ExamSeminar.Date", 386.0, 572.0, FontSize: 8.0);
        public static readonly PdfField Rating = new("ExamSeminar.Rating", 535.0, 572.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 195.96,
            Y: 693.0,
            Width: 322.73,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            TextTransform: TextTransform.Uppercase,
            FontSize: 9.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 196.15,
            Y: 722.0,
            Width: 122.5,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 470.0, 667.5, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 470, 678.5, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 528.0, 678.5, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 689.5, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 709.5,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            TextTransform: TextTransform.Uppercase,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
