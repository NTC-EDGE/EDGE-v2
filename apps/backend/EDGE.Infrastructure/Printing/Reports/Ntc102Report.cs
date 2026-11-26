using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-02 — Application for Radio Operator Certificate.
/// QuestPDF code-driven generator providing 1:1 official fallback document generation.
/// </summary>
public class Ntc102Report : FormDocument
{
    private readonly Ntc102Application _app;

    public Ntc102Report(Ntc102Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-02",
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
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR RADIO OPERATOR CERTIFICATE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationTypeAndCertificate(col);
            ComposeApplicantParticulars(col);
            ComposeExamSeminarDetails(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationTypeAndCertificate(ColumnDescriptor col)
    {
        SectionHeading(col, "I. Type of Application & Type of Certificate");

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

            row.RelativeItem(2).Column(c =>
            {
                c.Item().Text("Type of Certificate:").SemiBold();
                var tc = _app.TypeOfCertificate;

                c.Item().Row(r =>
                {
                    r.RelativeItem().Column(col1 =>
                    {
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Rtg1)} 1RTG (1st Class Radiotelegraph)");
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Rtg2)} 2RTG (2nd Class Radiotelegraph)");
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Rtg3)} 3RTG (3rd Class Radiotelegraph)");
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Phn1)} 1PHN (1st Class Radiotelephone)");
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Phn2)} 2PHN (2nd Class Radiotelephone)");
                        col1.Item().Text($"{Checkbox(tc == TypeOfCertificate.Phn3)} 3PHN (3rd Class Radiotelephone)");
                    });

                    r.RelativeItem().Column(col2 =>
                    {
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.RrocAircraft)} RROC-Aircraft");
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.TpRrocAircraft)} Temp ROC (TP-RROC-Aircraft)");
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.Groc)} GROC (Govt. Radio Operator)");
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.Rlm)} RLM (Restricted Land Mobile)");
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.Srop)} SROP (Special Radio Operator)");
                        col2.Item().Text($"{Checkbox(tc == TypeOfCertificate.Others)} Others: {_app.OtherCertificateDetails ?? ""}");
                    });
                });
            });
        });
    }

    private void ComposeApplicantParticulars(ColumnDescriptor col)
    {
        SectionHeading(col, "II. Applicant's Particulars");
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
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Citizenship / Nationality: ").SemiBold(); t.Span(p.Nationality); });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Height (cm): ").SemiBold(); t.Span(p.HeightCm?.ToString("F0") ?? ""); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Weight (kg): ").SemiBold(); t.Span(p.WeightKg?.ToString("F0") ?? ""); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Employment Status: ").SemiBold();
                bool isEmployed = p.EmploymentStatus == EmploymentStatus.EmployedLocal || p.EmploymentStatus == EmploymentStatus.EmployedForeign;
                t.Span($"{Checkbox(!isEmployed)} Unemployed  {Checkbox(isEmployed)} Employed ({Checkbox(p.EmploymentStatus == EmploymentStatus.EmployedLocal)} Local {Checkbox(p.EmploymentStatus == EmploymentStatus.EmployedForeign)} Foreign)");
            });
        });

        col.Item().PaddingTop(3).Text(t => { t.Span("Complete Mailing Address: ").SemiBold(); t.Span(p.Address.ToSingleLine()); });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Unit/Rm/Bldg: ").SemiBold(); t.Span(p.Address.UnitRoomBldgNo); });
            row.RelativeItem().Text(t => { t.Span("Street: ").SemiBold(); t.Span(p.Address.Street); });
            row.RelativeItem().Text(t => { t.Span("Barangay: ").SemiBold(); t.Span(p.Address.Barangay); });
        });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("City/Municipality: ").SemiBold(); t.Span(p.Address.CityMunicipality); });
            row.RelativeItem().Text(t => { t.Span("Province: ").SemiBold(); t.Span(p.Address.Province); });
            row.RelativeItem().Text(t => { t.Span("Zip Code: ").SemiBold(); t.Span(p.Address.ZipCode); });
        });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Contact Number: ").SemiBold(); t.Span(p.ContactNumber); });
            row.RelativeItem().Text(t => { t.Span("Email Address: ").SemiBold(); t.Span(p.Email); });
        });
    }

    private void ComposeExamSeminarDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "III. Examination / Seminar Details");
        var ex = _app.ExamSeminarDetails;

        col.Item().Row(row =>
        {
            row.RelativeItem(2).Text(t => { t.Span("Place of Exam / Seminar: ").SemiBold(); t.Span(ex.PlaceOfExamSeminar); });
            row.RelativeItem(1).Text(t => { t.Span("Date of Exam / Seminar: ").SemiBold(); t.Span(ex.Date != default ? ex.Date.ToString("MM/dd/yyyy") : ""); });
            row.RelativeItem(1).Text(t => { t.Span("Rating: ").SemiBold(); t.Span(ex.Rating); });
        });
    }

    private static string Checkbox(bool isChecked) => isChecked ? "[✔]" : "[  ]";
}
