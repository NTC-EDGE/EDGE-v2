using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-21 — Application for Duplicate / Certified True Copy of Permit, License, or Certificate.
/// QuestPDF code-driven generator providing 1:1 official fallback document generation.
/// </summary>
public class Ntc121Report : FormDocument
{
    private readonly Ntc121Application _app;

    public Ntc121Report(Ntc121Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-21",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = TypeOfApplication.Modification,
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
        "APPLICATION FOR DUPLICATE OF PERMIT / LICENSE / CERTIFICATE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeRequestTypeAndTargetDetails(col);
            ComposeApplicantDetails(col);
            ComposeCircumstancesOfLoss(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeRequestTypeAndTargetDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "I. Request Type & Permit / License / Certificate Particulars");

        bool isCtc = (_app.PermitLicenseCertType?.Contains("Certified True Copy", StringComparison.OrdinalIgnoreCase) ?? false) ||
                     (_app.PermitLicenseCertType?.Contains("CTC", StringComparison.OrdinalIgnoreCase) ?? false) ||
                     (_app.CircumstancesOfLossMutilation?.Contains("Certified True Copy", StringComparison.OrdinalIgnoreCase) ?? false);
        bool isDuplicate = !isCtc;

        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t =>
            {
                t.Span("Request Category: ").SemiBold();
                t.Span($"{Checkbox(isDuplicate)} DUPLICATE     {Checkbox(isCtc)} CERTIFIED TRUE COPY");
            });
        });

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn();
                cd.RelativeColumn();
                cd.RelativeColumn();
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Permit / License / Certificate Type: ").SemiBold();
                t.Span(_app.PermitLicenseCertType);
            });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Permit / RSL / Certificate No. / Call Sign: ").SemiBold();
                t.Span(_app.PermitLicenseCertNo);
            });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Validity Date: ").SemiBold();
                t.Span(_app.PermitLicenseCertValidity != default ? _app.PermitLicenseCertValidity.ToString("MM/dd/yyyy") : "");
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Station Location: ").SemiBold();
                t.Span(_app.ApplicantPerson.Address.ToSingleLine());
            });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("Radio Service: ").SemiBold();
                t.Span(!string.IsNullOrWhiteSpace(_app.PermitLicenseCertType) ? _app.PermitLicenseCertType : "N/A");
            });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t =>
            {
                t.Span("No. of Copies: ").SemiBold();
                t.Span("1");
            });
        });
    }

    private void ComposeApplicantDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "II. Applicant / Company Details");
        var p = _app.ApplicantPerson;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn();
                cd.RelativeColumn();
                cd.RelativeColumn();
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Last Name / Company: ").SemiBold(); t.Span(p.LastName); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("First Name: ").SemiBold(); t.Span(p.FirstName); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Middle Name: ").SemiBold(); t.Span(p.MiddleName); });
        });

        col.Item().PaddingTop(3).Text(t => { t.Span("Complete Address: ").SemiBold(); t.Span(p.Address.ToSingleLine()); });
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

    private void ComposeCircumstancesOfLoss(ColumnDescriptor col)
    {
        SectionHeading(col, "III. Circumstances of Loss / Mutilation");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).MinHeight(45).Padding(4)
            .Text(!string.IsNullOrWhiteSpace(_app.CircumstancesOfLossMutilation) ? _app.CircumstancesOfLossMutilation : "N/A");
    }

    private static string Checkbox(bool isChecked) => isChecked ? "[✔]" : "[  ]";
}
