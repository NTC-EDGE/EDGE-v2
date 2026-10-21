using System;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-25 — Complaint Form (Consumer Welfare & Subscriber Complaints).
/// Revision No. 03 (03/31/2025).
/// QuestPDF code-driven generator providing fallback document generation.
/// </summary>
public class Ntc125Report : IDocument
{
    private readonly Ntc125Application _app;

    public Ntc125Report(Ntc125Application app)
    {
        _app = app;
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(28);
            page.DefaultTextStyle(x => x.FontSize(8.5f).FontFamily(Fonts.Arial));

            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeBody);
            page.Footer().AlignCenter().Text(t =>
            {
                t.Span("Page ").FontSize(7.5f);
                t.CurrentPageNumber().FontSize(7.5f);
                t.Span(" of ").FontSize(7.5f);
                t.TotalPages().FontSize(7.5f);
                t.Span("  •  NTC 1-25 Rev. 03 (03/31/2025)  •  THIS FORM IS NOT FOR SALE AND CAN BE REPRODUCED").FontSize(7.5f).FontColor(Colors.Grey.Medium);
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
                    c.Item().Text("DEPARTMENT OF INFORMATION AND COMMUNICATIONS TECHNOLOGY").FontSize(8).Bold();
                    c.Item().Text("NATIONAL TELECOMMUNICATIONS COMMISSION").FontSize(10).Bold();
                    c.Item().Text("Consumer Welfare and Protection Division / Regional Office").FontSize(8);
                });

                row.ConstantItem(160).AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text("NTC 1-25").FontSize(11).Bold();
                    c.Item().AlignRight().Text($"Rev. {_app.RevisionNo} ({_app.RevisionDate:MM/dd/yyyy})").FontSize(7.5f);
                    if (!string.IsNullOrWhiteSpace(_app.ApplicationNumber) || !string.IsNullOrWhiteSpace(_app.ReferenceNumber))
                    {
                        var refNo = !string.IsNullOrWhiteSpace(_app.ApplicationNumber) ? _app.ApplicationNumber : _app.ReferenceNumber;
                        c.Item().AlignRight().Text($"Ref: {refNo}").FontSize(8).Bold();
                    }
                });
            });

            col.Item().PaddingTop(3).LineHorizontal(1).LineColor(Colors.Black);
            col.Item().PaddingTop(5).AlignCenter().Text("COMPLAINT FORM").FontSize(12).Bold();
            col.Item().AlignCenter().Text("Consumer Complaints on Telecommunications, Broadcast & Digital Services").FontSize(8).Italic();
        });
    }

    private void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeComplainantSection(col);
            ComposeServiceProviderSection(col);
            ComposeNatureOfComplaintSection(col);
            ComposeDetailsOfComplaintSection(col);
            ComposeDeclarationSection(col);
        });
    }

    private void ComposeComplainantSection(ColumnDescriptor col)
    {
        SectionHeading(col, "1. COMPLAINANT'S PARTICULARS");
        var c = _app.Complainant;
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(box =>
        {
            box.Item().Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Full Name: ").Bold(); t.Span(c.Name); });
                r.RelativeItem(1).Text(t => { t.Span("Sex: ").Bold(); t.Span(c.Sex); });
                r.RelativeItem(1).Text(t => { t.Span("Civil Status: ").Bold(); t.Span(c.CivilStatus); });
                r.RelativeItem(1).Text(t => { t.Span("Nationality: ").Bold(); t.Span(c.Nationality); });
            });

            box.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Residential Address: ").Bold(); t.Span(c.ResidentialAddress.ToSingleLine()); });
                r.RelativeItem(1).Text(t => { t.Span("Contact No.: ").Bold(); t.Span(c.ContactNumber); });
            });

            if (!string.IsNullOrWhiteSpace(c.Email))
            {
                box.Item().PaddingTop(3).Row(r =>
                {
                    r.RelativeItem().Text(t => { t.Span("Email Address: ").Bold(); t.Span(c.Email); });
                });
            }
        });
    }

    private void ComposeServiceProviderSection(ColumnDescriptor col)
    {
        SectionHeading(col, "2. PARTICULARS OF SERVICE PROVIDER / ENTITY COMPLAINED OF");
        var sp = _app.ServiceProvider;
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(box =>
        {
            box.Item().Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Business / Trade Name: ").Bold(); t.Span(sp.BusinessName); });
                r.RelativeItem(1).Text(t => { t.Span("Contact No: ").Bold(); t.Span(sp.ContactNumber); });
            });
            box.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem().Text(t => { t.Span("Business Address: ").Bold(); t.Span(sp.BusinessAddress); });
            });
        });
    }

    private void ComposeNatureOfComplaintSection(ColumnDescriptor col)
    {
        SectionHeading(col, "3. NATURE OF COMPLAINT");
        var nat = _app.NatureOfComplaint;
        var types = nat.ComplaintTypes ?? new System.Collections.Generic.List<string>();

        bool isBilling = types.Any(t => t.Contains("billing", StringComparison.OrdinalIgnoreCase));
        bool isSpam = types.Any(t => t.Contains("spam", StringComparison.OrdinalIgnoreCase));
        bool isPoor = types.Any(t => t.Contains("poor", StringComparison.OrdinalIgnoreCase) || t.Contains("service", StringComparison.OrdinalIgnoreCase));
        bool isScam = types.Any(t => t.Contains("scam", StringComparison.OrdinalIgnoreCase));
        bool isFairUse = types.Any(t => t.Contains("fair use", StringComparison.OrdinalIgnoreCase));
        bool isDenial = types.Any(t => t.Contains("denial", StringComparison.OrdinalIgnoreCase));
        bool isOthers = types.Any(t => t.Contains("other", StringComparison.OrdinalIgnoreCase)) || !string.IsNullOrWhiteSpace(nat.OthersSpecification);

        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(box =>
        {
            box.Item().Row(r =>
            {
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(isBilling ? "[ X ] Billing Complaint" : "[   ] Billing Complaint");
                    sc.Item().Text(isSpam ? "[ X ] Text Spam / Harassment" : "[   ] Text Spam / Harassment");
                    sc.Item().Text(isPoor ? "[ X ] Poor Service (Technical / Customer Service)" : "[   ] Poor Service (Technical / Customer Service)");
                });
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(isScam ? "[ X ] Text Scam / Fraud" : "[   ] Text Scam / Fraud");
                    sc.Item().Text(isFairUse ? "[ X ] Fair Use Policy (FUP) Issue" : "[   ] Fair Use Policy (FUP) Issue");
                    sc.Item().Text(isDenial ? "[ X ] Denial of Subscription Plan" : "[   ] Denial of Subscription Plan");
                });
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(isOthers ? "[ X ] Others" : "[   ] Others");
                    if (!string.IsNullOrWhiteSpace(nat.OthersSpecification))
                    {
                        sc.Item().Text($"     Specify: {nat.OthersSpecification}").FontSize(7.5f).Italic();
                    }
                });
            });

            box.Item().PaddingTop(4).Row(r =>
            {
                r.RelativeItem().Text(t =>
                {
                    t.Span("Date of Incident / Transaction: ").Bold();
                    t.Span(nat.DateOfIncident.HasValue && nat.DateOfIncident.Value != default ? nat.DateOfIncident.Value.ToString("MM/dd/yyyy") : "N/A");
                });
                r.RelativeItem().Text(t =>
                {
                    t.Span("Time of Incident / Transaction: ").Bold();
                    t.Span(!string.IsNullOrWhiteSpace(nat.TimeOfIncident) ? nat.TimeOfIncident : "N/A");
                });
            });
        });
    }

    private void ComposeDetailsOfComplaintSection(ColumnDescriptor col)
    {
        SectionHeading(col, "4. DETAILS OF COMPLAINT & SUPPORTING PROOFS");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(box =>
        {
            box.Item().Text("Summary of Incident / Grounds of Complaint:").Bold().FontSize(8);
            box.Item().PaddingTop(2).Background(Colors.Grey.Lighten5).Padding(4).MinHeight(60).Text(!string.IsNullOrWhiteSpace(_app.StateBrieflyDetails) ? _app.StateBrieflyDetails : "(No statement provided)").FontSize(8);

            if (_app.AttachedProofDocuments != null && _app.AttachedProofDocuments.Count > 0)
            {
                box.Item().PaddingTop(6).Text("Attached Supporting Documents / Proofs:").Bold().FontSize(8);
                box.Item().PaddingTop(2).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(24);
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(2);
                    });

                    table.Header(h =>
                    {
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(2).Text("#").Bold().FontSize(7.5f);
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(2).Text("Document Description").Bold().FontSize(7.5f);
                        h.Cell().Background(Colors.Grey.Lighten3).Padding(2).Text("File Reference").Bold().FontSize(7.5f);
                    });

                    int idx = 1;
                    foreach (var doc in _app.AttachedProofDocuments)
                    {
                        table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(2).Text(idx.ToString()).FontSize(7.5f);
                        table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(2).Text(doc.DocumentDescription).FontSize(7.5f);
                        table.Cell().BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(2).Text(doc.AttachmentFileName).FontSize(7.5f);
                        idx++;
                    }
                });
            }
        });
    }

    private void ComposeDeclarationSection(ColumnDescriptor col)
    {
        SectionHeading(col, "5. CERTIFICATION & UNDERTAKING");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(box =>
        {
            box.Item().Text(
                "I hereby certify under penalty of perjury that the facts and statements set forth in this complaint " +
                "are true, correct, and complete to the best of my personal knowledge and belief. " +
                "I further authorize the National Telecommunications Commission to coordinate with the concerned service provider " +
                "for appropriate resolution, investigation, and enforcement action pursuant to relevant telecommunications laws and NTC regulations.")
                .FontSize(7.5f).Italic();

            box.Item().PaddingTop(16).Row(r =>
            {
                r.RelativeItem();
                r.ConstantItem(240).Column(sc =>
                {
                    var sigName = !string.IsNullOrWhiteSpace(_app.Declaration.SignatoryName) ? _app.Declaration.SignatoryName : _app.Complainant.Name;
                    sc.Item().AlignCenter().Text(sigName).Bold().Underline();
                    sc.Item().AlignCenter().Text("Complainant's Signature Over Printed Name").FontSize(7.5f);
                    var dDate = _app.Declaration.DateAccomplished != default ? _app.Declaration.DateAccomplished.ToString("MM/dd/yyyy") : DateTime.Now.ToString("MM/dd/yyyy");
                    sc.Item().AlignCenter().Text($"Date Accomplished: {dDate}").FontSize(7.5f);
                });
            });
        });
    }

    private static void SectionHeading(ColumnDescriptor col, string title)
    {
        col.Item().PaddingTop(6).PaddingBottom(2).Background(Colors.Grey.Lighten3)
            .Padding(3).Text(title).Bold().FontSize(8.5f);
    }
}
