using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Base class for printable NTC forms. Holds the shared blocks every form's
/// JSON contract reuses (Applicant, Equipment[], Station[]+Antenna, Payment,
/// Declaration) as reusable QuestPDF components, so a form-specific subclass
/// only has to supply its header fields and call these helpers in whatever
/// order its layout needs.
/// </summary>
public abstract class FormDocument : IDocument
{
    protected ApplicationBase App { get; }

    protected FormDocument(ApplicationBase app)
    {
        App = app;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(30);
            page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeBody);
            page.Footer().AlignCenter().Text(text =>
            {
                text.Span("Page ").FontSize(8);
                text.CurrentPageNumber().FontSize(8);
                text.Span(" of ").FontSize(8);
                text.TotalPages().FontSize(8);
            });
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Republic of the Philippines").FontSize(8);
                    c.Item().Text("DEPARTMENT OF INFORMATION AND COMMUNICATIONS TECHNOLOGY")
                        .FontSize(8).Bold();
                    c.Item().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").FontSize(10).Bold();
                });

                row.ConstantItem(140).AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text($"{App.FormNo}").FontSize(11).Bold();
                    c.Item().AlignRight().Text($"Rev. {App.RevisionNo} ({App.RevisionDate:MM/dd/yyyy})").FontSize(7);
                });
            });

            col.Item().PaddingTop(4).LineHorizontal(1).LineColor(Colors.Black);

            col.Item().PaddingTop(6).AlignCenter().Text(FormTitle()).FontSize(12).Bold();

            col.Item().PaddingTop(4).Row(row =>
            {
                row.RelativeItem().Text($"Type of Application: {App.TypeOfApplication}").FontSize(9);
                if (App.NoOfYears is not null)
                    row.RelativeItem().AlignRight().Text($"No. of Years: {App.NoOfYears}").FontSize(9);
            });

            if (App.TypeOfApplication == TypeOfApplication.Modification && !string.IsNullOrWhiteSpace(App.ModificationReason))
            {
                col.Item().PaddingTop(2).Text($"Reason for Modification: {App.ModificationReason}").FontSize(8).Italic();
            }
        });
    }

    /// <summary>Override in the form-specific subclass to name the printed form.</summary>
    protected abstract string FormTitle();

    /// <summary>Override to lay out the body: call the section helpers below in the right order.</summary>
    protected abstract void ComposeBody(IContainer container);

    // ------------------------------------------------------------------
    // Shared section renderers — reused across all 8 non-array form types
    // ------------------------------------------------------------------

    protected void SectionHeading(ColumnDescriptor col, string title)
    {
        col.Item().PaddingTop(10).PaddingBottom(3).Background(Colors.Grey.Lighten3)
            .Padding(4).Text(title).Bold().FontSize(10);
    }

    protected void ComposeApplicant(ColumnDescriptor col)
    {
        SectionHeading(col, "I. Applicant Information");
        var a = App.Applicant;

        col.Item().Row(row =>
        {
            row.RelativeItem(2).Text(t => { t.Span("Name: ").SemiBold(); t.Span(a.Name); });
            row.RelativeItem(1).Text(t => { t.Span("Type of Entity: ").SemiBold(); t.Span(a.TypeOfEntity.ToString()); });
        });
        col.Item().PaddingTop(2).Text(t => { t.Span("Address: ").SemiBold(); t.Span(a.Address.ToSingleLine()); });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Contact No.: ").SemiBold(); t.Span(a.ContactNumber); });
            row.RelativeItem().Text(t => { t.Span("Email: ").SemiBold(); t.Span(a.Email); });
        });
    }

    protected void ComposeEquipmentTable(ColumnDescriptor col)
    {
        if (App.Equipment.Count == 0) return;

        SectionHeading(col, App.Equipment.Count > 1
            ? "II. Particulars of Equipment (see attached Form A for additional rows)"
            : "II. Particulars of Equipment");

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(2); // radio equipment
                c.RelativeColumn(1.3f); // make
                c.RelativeColumn(1.3f); // type/model
                c.RelativeColumn(1.3f); // serial no
                c.RelativeColumn(1); // power
                c.RelativeColumn(1.3f); // freq range
                c.ConstantColumn(35); // qty
            });

            table.Header(header =>
            {
                foreach (var h in new[] { "Radio Equipment", "Make", "Type/Model", "Serial No.", "Power Output", "Freq. Range", "Qty" })
                    header.Cell().Background(Colors.Grey.Lighten2).Padding(3).Text(h).Bold().FontSize(8);
            });

            foreach (var e in App.Equipment)
            {
                table.Cell().Padding(3).Text(e.RadioEquipment).FontSize(8);
                table.Cell().Padding(3).Text(e.Make).FontSize(8);
                table.Cell().Padding(3).Text(e.TypeModel).FontSize(8);
                table.Cell().Padding(3).Text(e.SerialNumber).FontSize(8);
                table.Cell().Padding(3).Text(e.PowerOutput).FontSize(8);
                table.Cell().Padding(3).Text(e.FrequencyRange).FontSize(8);
                table.Cell().Padding(3).AlignCenter().Text(e.Quantity.ToString()).FontSize(8);
            }
        });
    }

    protected void ComposeStationsAndAntennas(ColumnDescriptor col)
    {
        if (App.Stations.Count == 0) return;

        SectionHeading(col, App.Stations.Count > 1
            ? "III. Particulars of Station / Antenna (see attached Form E for additional stations)"
            : "III. Particulars of Station / Antenna");

        for (var i = 0; i < App.Stations.Count; i++)
        {
            var s = App.Stations[i];
            col.Item().PaddingTop(i == 0 ? 0 : 6).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Column(sc =>
            {
                sc.Item().Text($"Station {i + 1}").Bold().FontSize(9);
                sc.Item().PaddingTop(2).Row(row =>
                {
                    row.RelativeItem(2).Text(t => { t.Span("Exact Location: ").SemiBold(); t.Span(s.ExactLocation); });
                    row.RelativeItem(1).Text(t => { t.Span("Call Sign: ").SemiBold(); t.Span(s.CallSign); });
                });
                sc.Item().PaddingTop(2).Row(row =>
                {
                    row.RelativeItem().Text(t => { t.Span("Coordinates: ").SemiBold(); t.Span($"{s.Latitude}, {s.Longitude}"); });
                    row.RelativeItem().Text(t => { t.Span("Assigned Freq.: ").SemiBold(); t.Span(s.AssignedFreq); });
                    row.RelativeItem().Text(t => { t.Span("BW/Emission: ").SemiBold(); t.Span(s.BwEmission); });
                });
                sc.Item().PaddingTop(2).Row(row =>
                {
                    row.RelativeItem().Text(t => { t.Span("Configuration: ").SemiBold(); t.Span(s.Configuration); });
                    row.RelativeItem().Text(t => { t.Span("RSL No.: ").SemiBold(); t.Span(s.RslNo); });
                    row.RelativeItem().Text(t => { t.Span("Validity: ").SemiBold(); t.Span(s.Validity.ToString("MM/dd/yyyy")); });
                });
                if (!string.IsNullOrWhiteSpace(s.Others))
                    sc.Item().PaddingTop(2).Text(t => { t.Span("Others: ").SemiBold(); t.Span(s.Others); });

                if (s.Antenna is { } ant)
                {
                    sc.Item().PaddingTop(4).Text("Antenna Specification").SemiBold().FontSize(8.5f);
                    sc.Item().PaddingTop(1).Row(row =>
                    {
                        row.RelativeItem().Text(t => { t.Span("Type: ").SemiBold(); t.Span(ant.Type); });
                        row.RelativeItem().Text(t => { t.Span("Height: ").SemiBold(); t.Span($"{ant.HeightM} m"); });
                        row.RelativeItem().Text(t => { t.Span("Gain: ").SemiBold(); t.Span($"{ant.GainDbi} dBi"); });
                    });
                    sc.Item().PaddingTop(1).Row(row =>
                    {
                        row.RelativeItem().Text(t => { t.Span("Directivity: ").SemiBold(); t.Span($"{ant.DirectivityDegrees}\u00B0"); });
                        row.RelativeItem().Text(t => { t.Span("Polarization: ").SemiBold(); t.Span(ant.Polarization); });
                        row.RelativeItem().Text(t => { t.Span("Beamwidth: ").SemiBold(); t.Span($"{ant.BeamwidthDegrees}\u00B0"); });
                    });
                }
            });
        }
    }

    protected void ComposePayment(ColumnDescriptor col)
    {
        if (App.Payment is null) return;
        var p = App.Payment;

        SectionHeading(col, "IV. Payment (Official Receipt)");
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("OR No.: ").SemiBold(); t.Span(p.OrNo); });
            row.RelativeItem().Text(t => { t.Span("OR Date: ").SemiBold(); t.Span(p.OrDate.ToString("MM/dd/yyyy")); });
            row.RelativeItem().Text(t => { t.Span("Amount: ").SemiBold(); t.Span($"PHP {p.Amount:N2}"); });
            row.RelativeItem().Text(t => { t.Span("Collecting Officer: ").SemiBold(); t.Span(p.CollectingOfficer); });
        });
    }

    protected void ComposeDeclaration(ColumnDescriptor col)
    {
        SectionHeading(col, "V. Declaration");
        col.Item().PaddingTop(2).Text(
            "I hereby certify that the foregoing information given by me are true and correct to the best of my knowledge.");

        col.Item().PaddingTop(30).Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().LineHorizontal(1).LineColor(Colors.Black);
                c.Item().AlignCenter().Text(App.Declaration.SignatoryName).SemiBold();
                c.Item().AlignCenter().Text("Signature Over Printed Name").FontSize(7);
            });
            row.ConstantItem(30);
            row.RelativeItem().Column(c =>
            {
                c.Item().LineHorizontal(1).LineColor(Colors.Black);
                c.Item().AlignCenter().Text(App.Declaration.DateAccomplished.ToString("MM/dd/yyyy")).SemiBold();
                c.Item().AlignCenter().Text("Date Accomplished").FontSize(7);
            });
        });
    }
}
