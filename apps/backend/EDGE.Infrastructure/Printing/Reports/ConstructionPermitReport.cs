using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-11 — Application for Construction Permit / Radio Station License.
/// Only this class knows about the form's own extra fields (permit subtype, radio
/// service type, class of station); everything else is inherited from FormDocument.
/// To add a printer for any other form, subclass FormDocument the same way and only
/// write the parts that differ (title + the form-specific fields block).
/// </summary>
public class ConstructionPermitReport : FormDocument
{
    private readonly ConstructionPermitApplication _app;

    public ConstructionPermitReport(ConstructionPermitApplication app) : base(app)
    {
        _app = app;
    }

    protected override string FormTitle() =>
        _app.PermitSubtype == PermitSubtype.ConstructionPermit
            ? "APPLICATION FOR CONSTRUCTION PERMIT"
            : "APPLICATION FOR RADIO STATION LICENSE";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicant(col);
            ComposeFormSpecificFields(col);
            ComposeEquipmentTable(col);
            ComposeStationsAndAntennas(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeFormSpecificFields(ColumnDescriptor col)
    {
        SectionHeading(col, "Service Classification");

        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Permit Subtype: ").SemiBold(); t.Span(_app.PermitSubtype.ToString()); });
            row.RelativeItem().Text(t => { t.Span("Type of Radio Service: ").SemiBold(); t.Span(_app.TypeOfRadioService.ToString()); });
            row.RelativeItem().Text(t => { t.Span("Nature of Service: ").SemiBold(); t.Span(_app.NatureOfService.ToString()); });
        });

        col.Item().PaddingTop(4).Text("Class of Station:").SemiBold().FontSize(8.5f);
        col.Item().PaddingTop(2).Table(table =>
        {
            var labels = new[] { "RT", "FX", "FB", "ML", "P", "BC", "FC", "FA", "MA", "TC" };
            table.ColumnsDefinition(c =>
            {
                foreach (var _ in labels) c.RelativeColumn();
            });
            table.Header(header =>
            {
                foreach (var l in labels)
                    header.Cell().Background(QuestPDF.Helpers.Colors.Grey.Lighten2).AlignCenter().Padding(2).Text(l).Bold().FontSize(7);
            });

            var cos = _app.ClassOfStation;
            var values = new[] { cos.RT, cos.FX, cos.FB, cos.ML, cos.P, cos.BC, cos.FC, cos.FA, cos.MA, cos.TC };
            foreach (var v in values)
                table.Cell().AlignCenter().Padding(2).Text(v.ToString()).FontSize(7);
        });

        if (!string.IsNullOrWhiteSpace(_app.ClassOfStation.Other))
            col.Item().PaddingTop(2).Text(t => { t.DefaultTextStyle(x => x.FontSize(8)); t.Span("Other: ").SemiBold(); t.Span(_app.ClassOfStation.Other); });
    }
}
