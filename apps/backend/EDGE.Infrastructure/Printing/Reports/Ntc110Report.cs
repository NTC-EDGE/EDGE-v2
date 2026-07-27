using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-10 (Form E — Multiple Stations / Equipment Attachment Sheet).
/// QuestPDF code-driven generator providing multi-page flexibility when
/// station entries exceed flat template limits (> 4 stations/equipment columns).
/// </summary>
public class Ntc110Report : FormDocument
{
    private readonly Ntc110Application _app;

    public Ntc110Report(Ntc110Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-10",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = TypeOfApplication.New,
        Applicant = new Applicant { Name = app.ApplicantName },
        Declaration = app.Declaration
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "FORM E (MULTIPLE STATIONS / EQUIPMENT ATTACHMENT SHEET)";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicantName(col);
            ComposeStationEntriesTable(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeApplicantName(ColumnDescriptor col)
    {
        SectionHeading(col, "Applicant Information");
        col.Item().Text(t =>
        {
            t.Span("Applicant Name: ").SemiBold();
            t.Span(_app.ApplicantName);
        });
    }

    private void ComposeStationEntriesTable(ColumnDescriptor col)
    {
        SectionHeading(col, "Particulars of Stations, Equipment & Antennas");

        col.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(25);
                columns.RelativeColumn(3); // Station Specs
                columns.RelativeColumn(3); // Equipment Specs
                columns.RelativeColumn(3); // Antenna Specs
            });

            table.Header(header =>
            {
                header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("#").SemiBold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Station Details").SemiBold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Equipment Details").SemiBold();
                header.Cell().Background(Colors.Grey.Lighten2).Padding(4).Text("Antenna Details").SemiBold();
            });

            for (int i = 0; i < _app.Entries.Count; i++)
            {
                var entry = _app.Entries[i];
                var st = entry.ProposedStation;
                var eq = entry.Equipment;
                var ant = entry.Antenna;

                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Text((i + 1).ToString());

                // Station Cell
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Column(sc =>
                {
                    sc.Item().Text(t => { t.Span("Location: ").SemiBold(); t.Span(st.ExactLocation); });
                    sc.Item().Text(t => { t.Span("Coords: ").SemiBold(); t.Span($"{st.Latitude}, {st.Longitude}"); });
                    sc.Item().Text(t => { t.Span("Service Area: ").SemiBold(); t.Span(st.PointsOfCommServiceArea); });
                    sc.Item().Text(t => { t.Span("Freq: ").SemiBold(); t.Span(st.AssignedFreq); });
                    sc.Item().Text(t => { t.Span("BW/Emission: ").SemiBold(); t.Span(st.BwEmission); });
                    sc.Item().Text(t => { t.Span("Call Sign: ").SemiBold(); t.Span(st.CallSign); });
                    sc.Item().Text(t => { t.Span("RSL No: ").SemiBold(); t.Span(st.RslNo); });
                });

                // Equipment Cell
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Column(ec =>
                {
                    string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
                        ? $"{eq.Make} {eq.TypeModel}".Trim()
                        : eq.RadioEquipment;

                    ec.Item().Text(t => { t.Span("Make/Model: ").SemiBold(); t.Span(makeModel); });
                    ec.Item().Text(t => { t.Span("Serial No: ").SemiBold(); t.Span(eq.SerialNumber); });
                    ec.Item().Text(t => { t.Span("Power Output: ").SemiBold(); t.Span(eq.PowerOutput); });
                    ec.Item().Text(t => { t.Span("Freq Range: ").SemiBold(); t.Span(eq.FrequencyRange); });
                });

                // Antenna Cell
                table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(4).Column(ac =>
                {
                    ac.Item().Text(t => { t.Span("Type: ").SemiBold(); t.Span(ant.Type); });
                    if (ant.HeightM > 0) ac.Item().Text(t => { t.Span("Height: ").SemiBold(); t.Span($"{ant.HeightM} m"); });
                    if (ant.GainDbi > 0) ac.Item().Text(t => { t.Span("Gain: ").SemiBold(); t.Span($"{ant.GainDbi} dBi"); });
                    if (ant.DirectivityDegrees > 0) ac.Item().Text(t => { t.Span("Directivity: ").SemiBold(); t.Span($"{ant.DirectivityDegrees}°"); });
                    if (!string.IsNullOrWhiteSpace(ant.Polarization)) ac.Item().Text(t => { t.Span("Polarization: ").SemiBold(); t.Span(ant.Polarization); });
                });
            }
        });
    }
}
