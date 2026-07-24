using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Fields;

/// <summary>
/// Structured layout metadata constants for NTC Form 1-01 (Application for Commercial Radio Operator Exam).
/// </summary>
public static class Ntc101Fields
{
    public static class ExamCategory
    {
        public const double RtgPhnColX = 55;
        public const double AmateurRestrictedColX = 348;

        public static readonly PdfField Rtg1_Elements1_2_5_6_Code2520Wpm = new("ExamCategory.Rtg1_Elements1_2_5_6_Code2520Wpm", RtgPhnColX, 190);
        public static readonly PdfField Rtg1_Code2520Wpm = new("ExamCategory.Rtg1_Code2520Wpm", RtgPhnColX, 200);
        public static readonly PdfField Rtg2_Elements1_2_5_6_Code16Wpm = new("ExamCategory.Rtg2_Elements1_2_5_6_Code16Wpm", RtgPhnColX, 212);
        public static readonly PdfField Rtg2_Code16Wpm = new("ExamCategory.Rtg2_Code16Wpm", RtgPhnColX, 224);
        public static readonly PdfField Rtg3_Elements1_2_5_Code16Wpm = new("ExamCategory.Rtg3_Elements1_2_5_Code16Wpm", RtgPhnColX, 235);
        public static readonly PdfField Rtg3_Code16Wpm = new("ExamCategory.Rtg3_Code16Wpm", RtgPhnColX, 256);

        public static readonly PdfField Phn1_Elements1_2_3_4 = new("ExamCategory.Phn1_Elements1_2_3_4", RtgPhnColX, 275);
        public static readonly PdfField Phn2_Elements1_2_3 = new("ExamCategory.Phn2_Elements1_2_3", RtgPhnColX, 286);
        public static readonly PdfField Phn3_Elements1_2 = new("ExamCategory.Phn3_Elements1_2", RtgPhnColX, 298);

        public static readonly PdfField ClassA_Elements8_9_10_Code5Wpm = new("ExamCategory.ClassA_Elements8_9_10_Code5Wpm", AmateurRestrictedColX, 190);
        public static readonly PdfField ClassA_Code5WpmOnly = new("ExamCategory.ClassA_Code5WpmOnly", AmateurRestrictedColX, 200);
        public static readonly PdfField ClassB_Elements5_6_7 = new("ExamCategory.ClassB_Elements5_6_7", AmateurRestrictedColX, 212);
        public static readonly PdfField ClassB_Element2 = new("ExamCategory.ClassB_Element2", AmateurRestrictedColX, 224);
        public static readonly PdfField ClassC_Elements2_3_4 = new("ExamCategory.ClassC_Elements2_3_4", AmateurRestrictedColX, 235);
        public static readonly PdfField ClassD_Element2 = new("ExamCategory.ClassD_Element2", AmateurRestrictedColX, 256);
        public static readonly PdfField RrocAircraft_Element1 = new("ExamCategory.RrocAircraft_Element1", AmateurRestrictedColX, 284);

        public static readonly PdfField DateOfExam = new("ExamCategory.DateOfExam", 440.0, 296, FontSize: 8.0);
    }

    public static class Applicant
    {
        public static readonly PdfField LastName = new("Applicant.LastName", 97.0, 325.9, FontSize: 8.0, IsBold: true);
        public static readonly PdfField DateOfBirth = new("Applicant.DateOfBirth", 464.0, 325.9, FontSize: 8.0);

        public static readonly PdfField FirstName = new("Applicant.FirstName", 97.0, 337.7, FontSize: 8.0, IsBold: true);
        public static readonly PdfField SexMale = new("Applicant.SexMale", 433.5, 336.24);
        public static readonly PdfField SexFemale = new("Applicant.SexFemale", 523.1, 336.24);

        public static readonly PdfField MiddleName = new("Applicant.MiddleName", 97.0, 349.6, FontSize: 8.0, IsBold: true);
        public static readonly PdfField Nationality = new("Applicant.Nationality", 415.0, 349.6, FontSize: 8.0);

        public static readonly PdfField UnitRoomBldgNo = new("Applicant.UnitRoomBldgNo", 146.0, 361.5, FontSize: 8.0);
        public static readonly PdfField Street = new("Applicant.Street", 415.0, 361.5, FontSize: 8.0);

        public static readonly PdfField Barangay = new("Applicant.Barangay", 146.0, 373.4, FontSize: 8.0);
        public static readonly PdfField CityMunicipality = new("Applicant.CityMunicipality", 415.0, 373.4, FontSize: 8.0);

        public static readonly PdfField Province = new("Applicant.Province", 146.0, 385.3, FontSize: 8.0);
        public static readonly PdfField ZipCode = new("Applicant.ZipCode", 415.0, 385.3, FontSize: 8.0);

        public static readonly PdfField ContactNumber = new("Applicant.ContactNumber", 146.0, 397.1, FontSize: 8.0);
        public static readonly PdfField Email = new("Applicant.Email", 415.0, 397.1, FontSize: 8.0);

        public static readonly PdfField SchoolAttended = new("Applicant.SchoolAttended", 122.0, 409.0, FontSize: 8.0);
        public static readonly PdfField CourseTaken = new("Applicant.CourseTaken", 122.0, 420.9, FontSize: 8.0);
        public static readonly PdfField YearGraduated = new("Applicant.YearGraduated", 415.0, 420.9, FontSize: 8.0);
    }

    public static class Assistance
    {
        public static readonly PdfField NeedsAssistanceYes = new("Assistance.Yes", 323.3, 444.16);
        public static readonly PdfField NeedsAssistanceNo = new("Assistance.No", 372.3, 444.16);
        public static readonly PdfField Details = new("Assistance.Details", 244.0, 456.0, FontSize: 8.0);
    }

    public static class Declaration
    {
        public static readonly PdfField SignatoryName = new(
            "Declaration.SignatoryName",
            X: 179.46,
            Y: 534.0,
            Width: 269.4,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0,
            IsBold: true);

        public static readonly PdfField DateAccomplished = new(
            "Declaration.DateAccomplished",
            X: 179.46,
            Y: 557.0,
            Width: 122.5,
            HorizontalAlignment: HorizontalAlignment.Center,
            Anchor: PdfAnchor.BaselineCenter,
            FontSize: 8.0);
    }

    public static class Payment
    {
        public static readonly PdfField OrNo = new("Payment.OrNo", 478.0, 519.0, FontSize: 8.0);
        public static readonly PdfField OrDateMonthDay = new("Payment.OrDateMonthDay", 478.0, 532.0, FontSize: 8.0);
        public static readonly PdfField OrDateYear = new("Payment.OrDateYear", 539.0, 532.0, FontSize: 8.0);
        public static readonly PdfField Amount = new("Payment.Amount", 449.0, 544.0, FontSize: 8.0);
        public static readonly PdfField CollectingOfficer = new("Payment.CollectingOfficer", 464.0, 564.0, FontSize: 8.0);
    }

    public static class AdmissionSlip
    {
        // Left panel
        public static readonly PdfField ExamineeName =
            new("AdmissionSlip.ExamineeName", 171.0, 633.9, FontSize: 8.0);

        public static readonly PdfField MailingAddressLine1 =
            new("AdmissionSlip.MailingAddressLine1", 171.0, 645.8, FontSize: 8.0);

        public static readonly PdfField MailingAddressLine2 =
            new("AdmissionSlip.MailingAddressLine2", 171.0, 657.7, FontSize: 8.0);

        public static readonly PdfField ExaminationFor =
            new("AdmissionSlip.ExaminationFor", 171.0, 669.6, FontSize: 8.0);

        public static readonly PdfField PlaceOfExam =
            new("AdmissionSlip.PlaceOfExam", 171.0, 685.6, FontSize: 8.0);

        public static readonly PdfField DateOfExam =
            new("AdmissionSlip.DateOfExam", 171.0, 697.5, FontSize: 8.0);

        public static readonly PdfField TimeOfExam =
            new("AdmissionSlip.TimeOfExam", 171.0, 709.4, FontSize: 8.0);

        // Right panel (1" × 1" ID Picture)
        public static readonly PdfField ApplicantPhoto =
            new(
                "AdmissionSlip.ApplicantPhoto",
                X: 541.0,
                Y: 649.0,
                Width: 63.0,
                Height: 76.0,
                Anchor: PdfAnchor.TopLeft);

        // Signature area
        public static readonly PdfField AuthorizedOfficerSignature =
            new(
                "AdmissionSlip.AuthorizedOfficerSignature",
                X: 466.0,
                Y: 708.0,
                Width: 150.0,
                Height: 18.0,
                Anchor: PdfAnchor.TopLeft);

        public static readonly PdfField AuthorizedOfficer =
            new(
                "AdmissionSlip.AuthorizedOfficer",
                X: 466.0,
                Y: 724.0,
                Width: 150.0,
                HorizontalAlignment: HorizontalAlignment.Center,
                Anchor: PdfAnchor.BaselineCenter,
                FontSize: 8.0,
                IsBold: true);
    }
}
