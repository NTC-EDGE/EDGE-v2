using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-22 — Application for TVRO Registration Certificate / TVRO & CATV Station License.
/// QuestPDF code-driven generator providing 1:1 official fallback document generation.
/// </summary>
public class Ntc122Report : FormDocument
{
    private readonly Ntc122Application _app;

    public Ntc122Report(Ntc122Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-22",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = app.TypeOfApplication,
        NoOfYears = app.NoOfYears,
        Applicant = app.Applicant,
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR TVRO REGISTRATION CERTIFICATE / TVRO STATION LICENSE / CATV STATION LICENSE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicationAndLicenseClassification(col);
            ComposeApplicantAndStationLocation(col);
            ComposeTvroEquipmentTable(col);
            ComposeAntennaSystemTable(col);
            ComposeSignalReceptionTable(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicationAndLicenseClassification(ColumnDescriptor col)
    {
        SectionHeading(col, "I. Type of Application, License/Certificate & Classification");

        col.Item().Row(row =>
        {
            row.RelativeItem(1).Column(c =>
            {
                c.Item().Text("Type of Application:").SemiBold();
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.New)} NEW");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Renewal)} RENEWAL");
                c.Item().Text($"{Checkbox(_app.TypeOfApplication == TypeOfApplication.Modification)} MODIFICATION");

                c.Item().PaddingTop(2).Text(t =>
                {
                    t.Span("No. of Years: ").SemiBold();
                    t.Span(_app.NoOfYears?.ToString() ?? "N/A");
                });
            });

            row.RelativeItem(1.4f).Column(c =>
            {
                c.Item().Text("Type of License / Certificate:").SemiBold();
                var tl = _app.TypeOfLicenseCert;
                c.Item().Text($"{Checkbox(tl == TypeOfLicenseCert122.TvroRegistrationCert)} TVRO Registration Certificate");
                c.Item().Text($"{Checkbox(tl == TypeOfLicenseCert122.TvroStationLicense)} TVRO Station License");
                c.Item().Text($"{Checkbox(tl == TypeOfLicenseCert122.CatvStationLicense)} CATV Station License");
            });

            row.RelativeItem(1.4f).Column(c =>
            {
                c.Item().Text("Classification of Applicant:").SemiBold();
                var cl = _app.ClassificationOfApplicant;
                c.Item().Text($"{Checkbox(cl == ClassificationOfApplicant122.CommercialBroadcasting)} Commercial");
                c.Item().Text($"{Checkbox(cl == ClassificationOfApplicant122.NonCommercial)} Non-Commercial");
                c.Item().Text($"{Checkbox(cl == ClassificationOfApplicant122.Catv)} CATV");
                c.Item().Text($"{Checkbox(cl == ClassificationOfApplicant122.Others)} Others: {_app.ClassificationOthersDetails ?? ""}");
            });
        });
    }

    private void ComposeApplicantAndStationLocation(ColumnDescriptor col)
    {
        SectionHeading(col, "II. Applicant Details & Station Location / Coordinates");
        var a = _app.Applicant;
        var st = _app.ProposedStation;

        col.Item().Row(row =>
        {
            row.RelativeItem(2).Text(t => { t.Span("Applicant / Company Name: ").SemiBold(); t.Span(a.Name); });
            row.RelativeItem(1).Text(t => { t.Span("PA / CA No.: ").SemiBold(); t.Span(_app.PaCaNo); });
            row.RelativeItem(1).Text(t => { t.Span("Validity: ").SemiBold(); t.Span(_app.Validity != default ? _app.Validity.ToString("MM/dd/yyyy") : ""); });
        });

        col.Item().PaddingTop(2).Text(t => { t.Span("Business Address: ").SemiBold(); t.Span(a.Address.ToSingleLine()); });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Contact No.: ").SemiBold(); t.Span(a.ContactNumber); });
            row.RelativeItem().Text(t => { t.Span("Email: ").SemiBold(); t.Span(a.Email); });
            row.RelativeItem().Text(t => { t.Span("Service Area: ").SemiBold(); t.Span(_app.ServiceArea); });
        });

        col.Item().PaddingTop(3).Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn(2);
                cd.RelativeColumn(1);
                cd.RelativeColumn(1);
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Exact Station Location: ").SemiBold(); t.Span(st.ExactLocation); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Longitude: ").SemiBold(); t.Span(st.Longitude); });
            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(t => { t.Span("Latitude: ").SemiBold(); t.Span(st.Latitude); });
        });
    }

    private void ComposeTvroEquipmentTable(ColumnDescriptor col)
    {
        SectionHeading(col, "III. Particulars of TVRO Equipment");
        var eq = _app.Equipment;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(2);
                c.RelativeColumn(1.5f);
                c.RelativeColumn(1.5f);
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Make / Type / Model").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Serial Number").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Frequency Range").Bold().FontSize(8);
            });

            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(eq.MakeTypeModel).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(eq.SerialNumber).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(eq.FrequencyRange).FontSize(8);
        });
    }

    private void ComposeAntennaSystemTable(ColumnDescriptor col)
    {
        SectionHeading(col, "IV. Antenna System Particulars");
        var ant = _app.AntennaSystem;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn();
                c.RelativeColumn();
                c.RelativeColumn();
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Dish Diameter").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Polarization").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Azimuth / Elevation").Bold().FontSize(8);
            });

            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ant.DishDiameter).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ant.Polarization).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(ant.Azimuth).FontSize(8);
        });
    }

    private void ComposeSignalReceptionTable(ColumnDescriptor col)
    {
        SectionHeading(col, "V. Signal To Be Received");
        var sig = _app.SignalToBeReceived;

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(1.5f);
                c.RelativeColumn(1);
                c.RelativeColumn(1.2f);
                c.RelativeColumn(2);
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Satellite").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Polarization").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Received Frequency").Bold().FontSize(8);
                header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text("Name of Programs").Bold().FontSize(8);
            });

            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sig.Satellite).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sig.Polarization).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sig.ReceivedFrequency).FontSize(8);
            table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(3).Text(sig.NameOfPrograms).FontSize(8);
        });
    }

    private static string Checkbox(bool isChecked) => isChecked ? "[✔]" : "[  ]";
}
