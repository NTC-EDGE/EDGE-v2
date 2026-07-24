using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-02 (Application for Radio Operator License).
/// </summary>
public static class Ntc102Fields
{
    public static class TypeOfApplication
    {
        public static readonly PdfField New = new("TypeOfApplication.New", 71.92, 283.27);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", 71.92, 298.27);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", 71.92, 313.27);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 88.0, 332.0, FontSize: 8.0);
        public static readonly PdfField NoOfYears = new(
            "TypeOfApplication.NoOfYears",
            X: 121.53,
            Y: 358.28,
            Width: 25.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class TypeOfCertificate
    {
        public static readonly PdfField Rtg1 = new("TypeOfCertificate.Rtg1", 295.2, 283.27);
        public static readonly PdfField Rtg2 = new("TypeOfCertificate.Rtg2", 295.2, 298.27);
        public static readonly PdfField Rtg3 = new("TypeOfCertificate.Rtg3", 295.2, 313.27);
        public static readonly PdfField Phn1 = new("TypeOfCertificate.Phn1", 295.2, 328.27);
        public static readonly PdfField Phn2 = new("TypeOfCertificate.Phn2", 295.2, 343.28);
        public static readonly PdfField Phn3 = new("TypeOfCertificate.Phn3", 295.2, 358.28);

        public static readonly PdfField Srop = new("TypeOfCertificate.Srop", 394.44, 283.27);
        public static readonly PdfField Rlm = new("TypeOfCertificate.Rlm", 394.44, 298.27);
        public static readonly PdfField RrocAircraft = new("TypeOfCertificate.RrocAircraft", 394.44, 313.27);
        public static readonly PdfField Groc = new("TypeOfCertificate.Groc", 394.44, 328.27);
        public static readonly PdfField TpRrocAircraft = new("TypeOfCertificate.TpRrocAircraft", 394.44, 343.28);
        public static readonly PdfField Others = new("TypeOfCertificate.Others", 394.44, 358.28);
        public static readonly PdfField OtherCertificateDetails = new("TypeOfCertificate.OtherDetails", 410.0, 377.0, FontSize: 8.0);
    }

    public static class Applicant
    {
        public static readonly PdfField LastName = new("Applicant.LastName", 88.0, 422.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField DateOfBirth = new("Applicant.DateOfBirth", 460.0, 422.0, FontSize: 8.0);

        public static readonly PdfField FirstName = new("Applicant.FirstName", 88.0, 437.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField HeightCm = new("Applicant.HeightCm", 410.0, 437.0, FontSize: 8.0);
        public static readonly PdfField WeightKg = new("Applicant.WeightKg", 534.0, 437.0, FontSize: 8.0);

        public static readonly PdfField MiddleName = new("Applicant.MiddleName", 88.0, 452.0, FontSize: 8.0, IsBold: true);

        public static readonly PdfField SexMale = new("Applicant.SexMale", 109.13, 463.31);
        public static readonly PdfField SexFemale = new("Applicant.SexFemale", 208.36, 463.31);

        public static readonly PdfField Unemployed = new("Applicant.Unemployed", 394.44, 448.30);
        public static readonly PdfField Employed = new("Applicant.Employed", 493.68, 448.30);
        public static readonly PdfField EmployedLocal = new("Applicant.EmployedLocal", 419.25, 463.31);
        public static readonly PdfField EmployedForeign = new("Applicant.EmployedForeign", 419.25, 478.33);

        public static readonly PdfField Nationality = new("Applicant.Nationality", 88.0, 482.0, FontSize: 8.0);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 138.0, 497.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 386.0, 497.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 138.0, 512.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 386.0, 512.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 138.0, 527.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 386.0, 527.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 138.0, 542.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 386.0, 542.0, FontSize: 8.0);
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
            FontSize: 8.0,
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
        public static readonly PdfField OrNo = new("Payment.OrNo", 455.0, 667.5, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 459.0, 678.5, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 528.0, 678.5, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 689.5, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 709.5,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
