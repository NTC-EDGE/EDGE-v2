using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-14 (Application for Temporary Permit to Propagate/Demonstrate).
/// QuestPDF code-driven generator providing fallback document generation.
/// </summary>
public class Ntc114Report : FormDocument
{
    private readonly Ntc114Application _app;

    public Ntc114Report(Ntc114Application app) : base(new ConstructionPermitApplication
    {
        ApplicationId = app.ApplicationId,
        FormNo = "NTC 1-14",
        RevisionNo = app.RevisionNo,
        RevisionDate = app.RevisionDate,
        TypeOfApplication = TypeOfApplication.New,
        Applicant = app.Applicant,
        Declaration = app.Declaration,
        Payment = app.Payment
    })
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR TEMPORARY PERMIT TO PROPAGATE/DEMONSTRATE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeNatureAndServiceClass(col);
            ComposeApplicantDetails(col);
            ComposeParticulars(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeNatureAndServiceClass(ColumnDescriptor col)
    {
        SectionHeading(col, "Classification & Nature of Service");

        col.Item().Row(row =>
        {
            row.RelativeItem().Column(c =>
            {
                c.Item().Text(t =>
                {
                    t.Span("Nature of Service: ").SemiBold();
                    t.Span(_app.NatureOfService == NatureOfService114.Others ? _app.NatureOfServiceOther ?? "Others" : _app.NatureOfService.ToString());
                });
                c.Item().Text(t =>
                {
                    t.Span("Type of Radio Service: ").SemiBold();
                    t.Span(_app.TypeOfRadioService == TypeOfRadioService114.Others ? _app.TypeOfRadioServiceOther ?? "Others" : _app.TypeOfRadioService.ToString());
                });
            });

            row.RelativeItem().Column(c =>
            {
                var cs = _app.ClassOfStation;
                c.Item().Text(t =>
                {
                    t.Span("Class of Station: ").SemiBold();
                    var parts = new System.Collections.Generic.List<string>();
                    if (cs.RT > 0) parts.Add($"RT ({cs.RT})");
                    if (cs.FX > 0) parts.Add($"FX ({cs.FX})");
                    if (cs.FB > 0) parts.Add($"FB ({cs.FB})");
                    if (cs.ML > 0) parts.Add($"ML ({cs.ML})");
                    if (cs.P > 0) parts.Add($"P ({cs.P})");
                    if (cs.BC > 0) parts.Add($"BC ({cs.BC})");
                    if (cs.FA > 0) parts.Add($"FA ({cs.FA})");
                    if (cs.MA > 0) parts.Add($"MA ({cs.MA})");
                    if (cs.TC > 0) parts.Add($"TC ({cs.TC})");
                    if (!string.IsNullOrWhiteSpace(cs.Other)) parts.Add(cs.Other);
                    t.Span(string.Join(", ", parts));
                });
            });
        });
    }

    private void ComposeApplicantDetails(ColumnDescriptor col)
    {
        SectionHeading(col, "Applicant's Details");
        col.Item().Column(c =>
        {
            c.Item().Text(t => { t.Span("Applicant Name: ").SemiBold(); t.Span(_app.Applicant.Name); });
            c.Item().Text(t => { t.Span("Address: ").SemiBold(); t.Span(_app.Applicant.Address.ToSingleLine()); });
            c.Item().Text(t => { t.Span("Contact Number: ").SemiBold(); t.Span(_app.Applicant.ContactNumber); });
            c.Item().Text(t => { t.Span("Email Address: ").SemiBold(); t.Span(_app.Applicant.Email); });
        });
    }

    private void ComposeParticulars(ColumnDescriptor col)
    {
        SectionHeading(col, "Particulars of Station & Equipment");

        col.Item().Row(row =>
        {
            row.RelativeItem().Column(sc =>
            {
                var st = _app.ProposedStation;
                sc.Item().Text("Station Specs").Bold();
                sc.Item().Text(t => { t.Span("Exact Location: ").SemiBold(); t.Span(st.ExactLocation); });
                sc.Item().Text(t => { t.Span("Coordinates: ").SemiBold(); t.Span($"{st.Latitude}, {st.Longitude}"); });
                sc.Item().Text(t => { t.Span("Points of Comm / Service Area: ").SemiBold(); t.Span(st.PointsOfCommServiceArea); });
                sc.Item().Text(t => { t.Span("Proposed Freq: ").SemiBold(); t.Span(st.AssignedFreq); });
                sc.Item().Text(t => { t.Span("BW & Emission: ").SemiBold(); t.Span(st.BwEmission); });
                sc.Item().Text(t => { t.Span("Data Rate: ").SemiBold(); t.Span(st.DataRate); });
                if (!string.IsNullOrWhiteSpace(st.Others)) sc.Item().Text(t => { t.Span("Others: ").SemiBold(); t.Span(st.Others); });
            });

            row.RelativeItem().Column(ec =>
            {
                var eq = _app.Equipment;
                string makeModel = !string.IsNullOrWhiteSpace(eq.Make) || !string.IsNullOrWhiteSpace(eq.TypeModel)
                    ? $"{eq.Make} {eq.TypeModel}".Trim()
                    : eq.RadioEquipment;

                ec.Item().Text("Equipment Specs").Bold();
                ec.Item().Text(t => { t.Span("Make/Type/Model: ").SemiBold(); t.Span(makeModel); });
                ec.Item().Text(t => { t.Span("Serial Number: ").SemiBold(); t.Span(eq.SerialNumber); });
                ec.Item().Text(t => { t.Span("Power Output: ").SemiBold(); t.Span(eq.PowerOutput); });
                ec.Item().Text(t => { t.Span("Frequency Range: ").SemiBold(); t.Span(eq.FrequencyRange); });
            });
        });
    }
}
