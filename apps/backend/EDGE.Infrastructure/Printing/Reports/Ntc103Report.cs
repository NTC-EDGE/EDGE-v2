using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-03 — Application for Amateur Radio Operator Certificate / Station License.
/// QuestPDF code-driven generator providing 1:1 official fallback document generation.
/// </summary>
public class Ntc103Report : FormDocument
{
    private readonly Ntc103Application _app;

    public Ntc103Report(Ntc103Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-03",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = app.TypeOfApplication,
        ModificationReason = app.ModificationReason,
        NoOfYears = app.NoOfYears,
        Applicant = new Applicant
        {
            Name = $"{app.ApplicantPerson.LastName}, {app.ApplicantPerson.FirstName} {app.ApplicantPerson.MiddleName}".Trim(' ', ','),
            Address = app.ApplicantPerson.Address,
            ContactNumber = app.ApplicantPerson.ContactNumber,
            Email = app.ApplicantPerson.Email
        },
        Equipment = app.Equipment,
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR AMATEUR RADIO OPERATOR CERTIFICATE / AMATEUR RADIO STATION LICENSE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationTypeAndLicenseClass(col);
            ComposeApplicantAndExistingLicense(col);
            ComposeClubAndSpecialDetails(col);
            ComposeExamDetails(col);
            ComposeEquipmentTable(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationTypeAndLicenseClass(ColumnDescriptor col)
    {
        SectionHeading(col, "I. Type of Application, Certificate/License & Amateur Class");

        col.Item().Row(row =>
        {
            row.RelativeItem(1).Column(c =>
            {
                c.Item().Text("Type of Application:").SemiBold();
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.New)} NEW");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Renewal)} RENEWAL");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Modification)} MODIFICATION");

                if (!string.IsNullOrWhiteSpace(_app.ModificationReason))
                {
                    c.Item().PaddingTop(2).Text(t =>
                    {
                        t.Span("Reason for Modification: ").SemiBold();
                        t.Span(_app.ModificationReason);
                    });
                }

                c.Item().PaddingTop(2).Text(t =>
                {
                    t.Span("No. of Years: ").SemiBold();
                    t.Span(_app.NoOfYears?.ToString() ?? "N/A");
                });
            });

            row.RelativeItem(1.5f).Column(c =>
            {
                c.Item().Text("Type of Certificate / Permit / License:").SemiBold();
                var tp = _app.TypeOfPermitLicenseCert;
                bool isLifetime = tp == TypeOfPermitLicenseCert103.AmateurRadioStationLicense &&
                                  _app.ClassOfStation == ClassOfStationAmateur.ClassA &&
                                  (_app.NoOfYears is null or >= 10);

                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert103.AmateurRadioOperatorCertificate)} AT-ROC (Amateur Radio Operator Certificate)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert103.AmateurRadioStationLicense)} AT-RSL (Amateur Radio Station License)");
                c.Item().Text($"{Checkbox(isLifetime)} AT-LIFETIME (Lifetime Amateur Radio Station License)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert103.ClubRadioStationLicense)} AT-CLUB-RSL (Club Radio Station License)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert103.TemporaryPermitForeignVisitor)} Temporary Permit (Foreign Visitor)");
                c.Item().Text($"{Checkbox(tp == TypeOfPermitLicenseCert103.SpecialPermitVanityCallSign)} Special Event / Vanity Call Sign Permit");
            });

            row.RelativeItem(0.9f).Column(c =>
            {
                c.Item().Text("Amateur Class:").SemiBold();
                var cls = _app.ClassOfStation;
                c.Item().Text($"{Checkbox(cls == ClassOfStationAmateur.ClassA)} Class A (Extra)");
                c.Item().Text($"{Checkbox(cls == ClassOfStationAmateur.ClassB)} Class B (General)");
                c.Item().Text($"{Checkbox(cls == ClassOfStationAmateur.ClassC)} Class C (Technician)");
                c.Item().Text($"{Checkbox(cls == ClassOfStationAmateur.ClassD)} Class D (Foundation)");
            });
        });
    }

    private void ComposeApplicantAndExistingLicense(ColumnDescriptor col)
    {
        SectionHeading(col, "II. Applicant Profile & Existing License Details");
        var p = _app.ApplicantPerson;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn();
                cd.RelativeColumn();
                cd.RelativeColumn();
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Last Name: ").SemiBold(); t.Span(p.LastName); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("First Name: ").SemiBold(); t.Span(p.FirstName); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Middle Name: ").SemiBold(); t.Span(p.MiddleName); });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Date of Birth: ").SemiBold(); t.Span(p.DateOfBirth != default ? p.DateOfBirth.ToString("MM/dd/yyyy") : ""); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Sex: ").SemiBold(); t.Span($"{Checkbox(p.Sex == Sex.Male)} Male   {Checkbox(p.Sex == Sex.Female)} Female"); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Nationality: ").SemiBold(); t.Span(p.Nationality); });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Existing Call Sign: ").SemiBold(); t.Span(_app.CallSign); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("ATROC / ARSL No.: ").SemiBold(); t.Span(_app.AtrocArslNo); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Validity / Expiry: ").SemiBold(); t.Span(_app.Validity != default ? _app.Validity.ToString("MM/dd/yyyy") : ""); });
        });

        col.Item().PaddingTop(3).Text(t => { t.Span("Address: ").SemiBold(); t.Span(p.Address.ToSingleLine()); });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Contact Number: ").SemiBold(); t.Span(p.ContactNumber); });
            row.RelativeItem().Text(t => { t.Span("Email Address: ").SemiBold(); t.Span(p.Email); });
        });
    }

    private void ComposeClubAndSpecialDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "III. Club / Trustee / Vanity Call Sign Details");
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Name of Club / Trustee: ").SemiBold(); t.Span(_app.NameOfClub ?? "N/A"); });
            row.RelativeItem().Text(t => { t.Span("Assigned Frequency: ").SemiBold(); t.Span(_app.AssignedFreq ?? "N/A"); });
            row.RelativeItem().Text(t => { t.Span("Preferred Call Signs: ").SemiBold(); t.Span(_app.PreferredCallSigns ?? "N/A"); });
        });
    }

    private void ComposeExamDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "IV. Examination / Seminar Details");
        var ex = _app.ExamSeminarDetails;

        col.Item().Row(row =>
        {
            row.RelativeItem(2).Text(t => { t.Span("Place of Exam / Seminar: ").SemiBold(); t.Span(ex.PlaceOfExamSeminar); });
            row.RelativeItem(1).Text(t => { t.Span("Date of Exam: ").SemiBold(); t.Span(ex.Date != default ? ex.Date.ToString("MM/dd/yyyy") : ""); });
            row.RelativeItem(1).Text(t => { t.Span("Rating: ").SemiBold(); t.Span(ex.Rating); });
        });
    }

    private static string Checkbox(bool isChecked) => isChecked ? "[✔]" : "[  ]";
}
