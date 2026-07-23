using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-09 — Application for Permit to Purchase/Possess/Sell/Transfer.
/// Demonstrates a form whose "station" data is a single ProposedStation object
/// rather than the shared Stations[] collection, plus its own dealer/source block.
/// </summary>
public class PurchasePossessSellTransferReport : FormDocument
{
    private readonly PurchasePossessSellTransferApplication _app;

    public PurchasePossessSellTransferReport(PurchasePossessSellTransferApplication app) : base(app)
    {
        _app = app;
    }

    protected override string FormTitle() =>
        "APPLICATION FOR PERMIT TO PURCHASE / POSSESS / SELL / TRANSFER";

    protected override void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeApplicant(col);
            ComposeClassification(col);
            ComposeEquipmentTable(col);
            ComposeProposedStation(col);
            ComposeSourceOfEquipment(col);
            ComposePayment(col);
            ComposeDeclaration(col);
        });
    }

    private void ComposeClassification(ColumnDescriptor col)
    {
        SectionHeading(col, "Application Details");
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Application Type: ").SemiBold(); t.Span(_app.TypeOfApplicationSpecific.ToString()); });
            row.RelativeItem().Text(t => { t.Span("Radio Service: ").SemiBold(); t.Span(_app.TypeOfRadioService.ToString()); });
            row.RelativeItem().Text(t => { t.Span("Nature of Service: ").SemiBold(); t.Span(_app.NatureOfService.ToString()); });
        });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("CPC/CPCN/PA/RSL No.: ").SemiBold(); t.Span(_app.CpcCpcnPaRslNo); });
            row.RelativeItem().Text(t => { t.Span("Validity: ").SemiBold(); t.Span(_app.Validity.ToString("MM/dd/yyyy")); });
            row.RelativeItem().Text(t => { t.Span("Intended Use: ").SemiBold(); t.Span(_app.IntendedUse.ToString()); });
        });
        if (!string.IsNullOrWhiteSpace(_app.ClassOfStation.Other))
            col.Item().PaddingTop(2).Text(t => { t.Span("Class of Station: ").SemiBold(); t.Span(_app.ClassOfStation.Other); });
    }

    private void ComposeProposedStation(ColumnDescriptor col)
    {
        var s = _app.ProposedStation;
        SectionHeading(col, "Proposed Station");

        col.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Padding(5).Column(sc =>
        {
            sc.Item().Row(row =>
            {
                row.RelativeItem(2).Text(t => { t.Span("Exact Location: ").SemiBold(); t.Span(s.ExactLocation); });
                row.RelativeItem(1).Text(t => { t.Span("Call Sign: ").SemiBold(); t.Span(s.CallSign); });
            });
            sc.Item().PaddingTop(2).Row(row =>
            {
                row.RelativeItem().Text(t => { t.Span("Coordinates: ").SemiBold(); t.Span($"{s.Latitude}, {s.Longitude}"); });
                row.RelativeItem().Text(t => { t.Span("Assigned Freq.: ").SemiBold(); t.Span(s.AssignedFreq); });
                row.RelativeItem().Text(t => { t.Span("RSL No.: ").SemiBold(); t.Span(s.RslNo); });
            });
            sc.Item().PaddingTop(2).Text(t => { t.Span("Points of Communication / Service Area: ").SemiBold(); t.Span(s.PointsOfCommServiceArea); });
        });
    }

    private void ComposeSourceOfEquipment(ColumnDescriptor col)
    {
        var src = _app.SourceOfEquipment;
        SectionHeading(col, "Source of Equipment");
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Dealer: ").SemiBold(); t.Span(src.NameOfDealer); });
            row.RelativeItem().Text(t => { t.Span("OR/Invoice No.: ").SemiBold(); t.Span(src.OrInvoiceNo); });
        });
        col.Item().PaddingTop(2).Row(row =>
        {
            row.RelativeItem().Text(t => { t.Span("Authorized Seller/Buyer: ").SemiBold(); t.Span(src.AuthorizedSellerBuyer); });
            row.RelativeItem().Text(t => { t.Span("Permit/RSL No.: ").SemiBold(); t.Span(src.PermitRslNo); });
        });
    }
}
