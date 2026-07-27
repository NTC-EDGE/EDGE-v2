using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-03 (Application for Amateur Radio Station License).
/// </summary>
public static class Ntc103Fields
{
    public static class TypeOfApplication
    {
        public const double AppTypeColX = 96;
        public static readonly PdfField New = new("TypeOfApplication.New", AppTypeColX, 232.45);
        public static readonly PdfField Renewal = new("TypeOfApplication.Renewal", AppTypeColX, 247.45);
        public static readonly PdfField Modification = new("TypeOfApplication.Modification", AppTypeColX, 262.45);
        public static readonly PdfField ModificationReason = new("TypeOfApplication.Reason", 114.0, 282.0, FontSize: 8.0);
        public static readonly PdfField NoOfYears = new(
            "TypeOfApplication.NoOfYears",
            X: 140.0,
            Y: 355.0,
            Width: 23.2,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);
    }

    public static class TypeOfPermitLicenseCert
    {
        public const double PermitTypeColX = 257;
        public static readonly PdfField AmateurRadioOperatorCertificate = new("TypeOfPermit.AROC", PermitTypeColX, 250);
        public static readonly PdfField AmateurRadioStationLicense = new("TypeOfPermit.ARSL", PermitTypeColX, 267.0);
        public static readonly PdfField ClubRadioStationLicense = new("TypeOfPermit.ClubARSL", PermitTypeColX, 296.0);
        public static readonly PdfField TemporaryPermitForeignVisitor = new("TypeOfPermit.ForeignVisitor", PermitTypeColX, 340.0);
        public static readonly PdfField SpecialPermitVanityCallSign = new("TypeOfPermit.VanityCallSign", PermitTypeColX, 355.0);

        public static readonly PdfField NameOfClub = new("TypeOfPermit.NameOfClub", 344.0, 311.0, FontSize: 8.0);
        public static readonly PdfField AssignedFreq = new("TypeOfPermit.AssignedFreq", 344.0, 326.0, FontSize: 8.0);
        public static readonly PdfField PreferredCallSigns = new("TypeOfPermit.PreferredCallSigns", 370.0, 372.0, FontSize: 8.0);
    }

    public static class ClassOfStation
    {
        public const double ClassOfStationColX = 465;
        public static readonly PdfField ClassA = new("ClassOfStation.ClassA", ClassOfStationColX, 235.0);
        public static readonly PdfField ClassB = new("ClassOfStation.ClassB", ClassOfStationColX, 250.0);
        public static readonly PdfField ClassC = new("ClassOfStation.ClassC", ClassOfStationColX, 265.0);
        public static readonly PdfField ClassD = new("ClassOfStation.ClassD", ClassOfStationColX, 280.0);
    }

    public static class Applicant
    {
        public static readonly PdfField LastName = new("Applicant.LastName", 114.0, 410.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField DateOfBirth = new("Applicant.DateOfBirth", 459.0, 410.0, FontSize: 8.0);

        public static readonly PdfField FirstName = new("Applicant.FirstName", 114.0, 425.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField SexMale = new("Applicant.SexMale", 409.04, 425.0);
        public static readonly PdfField SexFemale = new("Applicant.SexFemale", 501.06, 425.0);

        public static readonly PdfField MiddleName = new("Applicant.MiddleName", 114.0, 440.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField Nationality = new("Applicant.Nationality", 390.0, 440.0, FontSize: 8.0);

        public static readonly PdfField CallSign = new("Applicant.CallSign", 114.0, 455.0, FontSize: 8.0, IsBold: true);
        public static readonly PdfField AtrocArslNo = new("Applicant.AtrocArslNo", 298.0, 455.0, FontSize: 8.0);
        public static readonly PdfField Validity = new("Applicant.Validity", 505.0, 455.0, FontSize: 8.0);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 160.0, 470.0, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 390.0, 470.0, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 160.0, 485.0, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 390.0, 485.0, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 160.0, 500.0, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 390.0, 500.0, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 160.0, 515.0, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 390.0, 515.0, FontSize: 8.0);
    }

    public static class ExamSeminarDetails
    {
        public static readonly PdfField PlaceOfExamSeminar = new("ExamSeminar.Place", 160.0, 544.0, FontSize: 8.0);
        public static readonly PdfField Date = new("ExamSeminar.Date", 413.0, 544.0, FontSize: 8.0);
        public static readonly PdfField Rating = new("ExamSeminar.Rating", 529.0, 544.0, FontSize: 8.0);
    }

    public static class Equipment
    {
        public static readonly PdfField MakeRow1 = new("Equipment.Make.1", 45.0, 589.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow1 = new("Equipment.TypeModel.1", 160.0, 589.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow1 = new("Equipment.SerialNumber.1", 275.0, 589.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRangeRow1 = new("Equipment.FrequencyRange.1", 459.0, 589.0, FontSize: 8.0);

        public static readonly PdfField MakeRow2 = new("Equipment.Make.2", 45.0, 604.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow2 = new("Equipment.TypeModel.2", 160.0, 604.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow2 = new("Equipment.SerialNumber.2", 275.0, 604.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRangeRow2 = new("Equipment.FrequencyRange.2", 459.0, 604.0, FontSize: 8.0);

        public static readonly PdfField MakeRow3 = new("Equipment.Make.3", 45.0, 619.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow3 = new("Equipment.TypeModel.3", 160.0, 619.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow3 = new("Equipment.SerialNumber.3", 275.0, 619.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRangeRow3 = new("Equipment.FrequencyRange.3", 459.0, 619.0, FontSize: 8.0);

        public static readonly PdfField MakeRow4 = new("Equipment.Make.4", 45.0, 634.0, FontSize: 8.0);
        public static readonly PdfField TypeModelRow4 = new("Equipment.TypeModel.4", 160.0, 634.0, FontSize: 8.0);
        public static readonly PdfField SerialNumberRow4 = new("Equipment.SerialNumber.4", 275.0, 634.0, FontSize: 8.0);
        public static readonly PdfField FrequencyRangeRow4 = new("Equipment.FrequencyRange.4", 459.0, 634.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 213.8,
            Y: 740.0,
            Width: 300.4,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 219.05,
            Y: 774.0,
            Width: 146.9,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 465.0, 717.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 465.0, 728.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 528.0, 728.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 445.0, 739.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new(
            "Payment.CollectingOfficer",
            X: 475.0,
            Y: 759.0,
            Width: 110.0,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }
}
