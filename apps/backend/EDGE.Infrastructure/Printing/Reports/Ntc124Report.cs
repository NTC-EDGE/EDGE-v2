using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable NTC 1-24 — Affidavit of Ownership and Loss with Undertaking
/// (For Blocking / Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone).
/// Revision No. 02 (03/31/2023).
/// QuestPDF code-driven generator providing fallback document generation.
/// </summary>
public class Ntc124Report : IDocument
{
    private readonly Ntc124Application _app;

    public Ntc124Report(Ntc124Application app)
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
                t.Span("  •  NTC 1-24 Rev. 02 (03/31/2023)").FontSize(7.5f).FontColor(Colors.Grey.Medium);
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
                });

                row.ConstantItem(150).AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text("NTC 1-24").FontSize(11).Bold();
                    c.Item().AlignRight().Text($"Rev. {_app.RevisionNo} ({_app.RevisionDate:MM/dd/yyyy})").FontSize(7.5f);
                });
            });

            col.Item().PaddingTop(3).LineHorizontal(1).LineColor(Colors.Black);
            col.Item().PaddingTop(5).AlignCenter().Text("AFFIDAVIT OF OWNERSHIP AND LOSS WITH UNDERTAKING").FontSize(11.5f).Bold();
            col.Item().AlignCenter().Text("(FOR BLOCKING / UNBLOCKING OF IMEI AND SIM OF LOST/STOLEN MOBILE PHONE)").FontSize(8).Italic();

            col.Item().PaddingTop(6).Row(row =>
            {
                var isBlock = _app.ActionRequested == ActionRequested124.Block;
                row.RelativeItem().Text(t =>
                {
                    t.Span("ACTION REQUESTED:   ").Bold();
                    t.Span(isBlock ? "[ X ] BLOCK GSM Handset      [   ] UNBLOCK GSM Handset" : "[   ] BLOCK GSM Handset      [ X ] UNBLOCK GSM Handset").SemiBold();
                });
            });
        });
    }

    private void ComposeBody(IContainer container)
    {
        container.Column(col =>
        {
            ComposeAffiantSection(col);
            ComposeMobileDetailsSection(col);
            ComposeProofOfOwnershipSection(col);
            ComposeIncidentSection(col);
            ComposeUndertakingAndDeclaration(col);
            ComposeNotaryPublicSection(col);
        });
    }

    private void ComposeAffiantSection(ColumnDescriptor col)
    {
        SectionHeading(col, "1. AFFIANT DETAILS");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Name: ").Bold(); t.Span(_app.AffiantName); });
                r.RelativeItem(1).Text(t => { t.Span("Age: ").Bold(); t.Span(_app.Age > 0 ? _app.Age.ToString() : ""); });
                r.RelativeItem(1).Text(t => { t.Span("Citizenship: ").Bold(); t.Span(_app.Citizenship); });
            });

            c.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Residential Address: ").Bold(); t.Span(_app.ResidentialAddress.ToSingleLine()); });
                r.RelativeItem(1).Text(t => { t.Span("Tel / Mobile: ").Bold(); t.Span(_app.TelephoneNumber); });
            });

            if (!string.IsNullOrWhiteSpace(_app.OfficeAddress.ToSingleLine()) || !string.IsNullOrWhiteSpace(_app.OfficeTelephoneNumber))
            {
                c.Item().PaddingTop(3).Row(r =>
                {
                    r.RelativeItem(2).Text(t => { t.Span("Office Address: ").Bold(); t.Span(_app.OfficeAddress.ToSingleLine()); });
                    r.RelativeItem(1).Text(t => { t.Span("Office Tel: ").Bold(); t.Span(_app.OfficeTelephoneNumber); });
                });
            }
        });
    }

    private void ComposeMobileDetailsSection(ColumnDescriptor col)
    {
        SectionHeading(col, "2. PARTICULARS OF MOBILE PHONE HANDSET & SIM");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.RelativeItem().Text(t => { t.Span("IMEI Number: ").Bold(); t.Span(_app.ImeiNo); });
                r.RelativeItem().Text(t => { t.Span("Make / Model / Type: ").Bold(); t.Span(_app.MakeModelType); });
            });
            c.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem().Text(t => { t.Span("SIM Card / Mobile No: ").Bold(); t.Span(_app.SimMobileNumber); });
            });
        });
    }

    private void ComposeProofOfOwnershipSection(ColumnDescriptor col)
    {
        SectionHeading(col, "3. PROOF OF OWNERSHIP & IDENTIFICATION SUBMITTED");
        var p = _app.ProofOfOwnership;
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(p.CopyGovernmentId ? "[ X ] Copy of Government ID / Passport" : "[   ] Copy of Government ID / Passport");
                    sc.Item().Text(p.CopySchoolId ? "[ X ] Copy of School ID (for students)" : "[   ] Copy of School ID (for students)");
                    sc.Item().Text(p.CopyBirthCertOrNbi ? "[ X ] Copy of Birth Certificate / NBI" : "[   ] Copy of Birth Certificate / NBI");
                });
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(p.ProofOfOwnershipReceipt ? "[ X ] Proof of Ownership / Official Receipt" : "[   ] Proof of Ownership / Official Receipt");
                    sc.Item().Text(p.BoxWithImei ? "[ X ] Box of Mobile Phone with IMEI" : "[   ] Box of Mobile Phone with IMEI");
                    sc.Item().Text(p.CertificateOfPurchase ? "[ X ] Certificate of Purchase" : "[   ] Certificate of Purchase");
                    sc.Item().Text(p.AffidavitInAbsence ? "[ X ] Affidavit in absence of receipts" : "[   ] Affidavit in absence of receipts");
                });
            });
        });
    }

    private void ComposeIncidentSection(ColumnDescriptor col)
    {
        SectionHeading(col, "4. INCIDENT & DEMOGRAPHIC DETAILS");
        var inc = _app.Incident;
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.RelativeItem().Text(t =>
                {
                    t.Span("Incident Type: ").Bold();
                    t.Span(inc.IncidentType == IncidentType124.Stolen ? "[ X ] Stolen  [   ] Lost/Misplaced" : "[   ] Stolen  [ X ] Lost/Misplaced");
                });
                r.RelativeItem().Text(t =>
                {
                    t.Span("Sex: ").Bold();
                    t.Span(inc.Sex == Sex.Male ? "[ X ] Male  [   ] Female" : "[   ] Male  [ X ] Female");
                });
                r.RelativeItem().Text(t =>
                {
                    t.Span("Time of Incident: ").Bold();
                    t.Span(inc.TimeOfDay == TimeOfDay124.Nighttime ? "[ X ] Nighttime  [   ] Daytime" : "[   ] Nighttime  [ X ] Daytime");
                });
            });

            c.Item().PaddingTop(3).Row(r =>
            {
                r.RelativeItem(2).Text(t => { t.Span("Place of Incident: ").Bold(); t.Span(inc.PlaceOfIncident); });
                r.RelativeItem(1).Text(t =>
                {
                    t.Span("Date of Incident: ").Bold();
                    t.Span(inc.DateOfIncident != default ? inc.DateOfIncident.ToString("MM/dd/yyyy") : "");
                });
            });
        });
    }

    private void ComposeUndertakingAndDeclaration(ColumnDescriptor col)
    {
        SectionHeading(col, "5. UNDERTAKING & DECLARATION");
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            c.Item().Text(
                "I hereby declare under oath that I am the lawful owner of the mobile phone handset described above. " +
                "I further undertake to hold the National Telecommunications Commission (NTC) and the relevant network service providers " +
                "free and harmless from any and all liability, claims, damages, or suits arising from the action requested herein. " +
                "I affirm that all statements herein are true and correct to the best of my personal knowledge and belief.")
                .FontSize(7.5f).Italic();

            c.Item().PaddingTop(12).Row(r =>
            {
                r.RelativeItem();
                r.ConstantItem(220).Column(sc =>
                {
                    sc.Item().AlignCenter().Text(!string.IsNullOrWhiteSpace(_app.Declaration.SignatoryName) ? _app.Declaration.SignatoryName : _app.AffiantName).Bold().Underline();
                    sc.Item().AlignCenter().Text("Affiant / Complainant Signature Over Printed Name").FontSize(7.5f);
                    sc.Item().AlignCenter().Text($"Date: {(_app.Declaration.DateAccomplished != default ? _app.Declaration.DateAccomplished.ToString("MM/dd/yyyy") : DateTime.Now.ToString("MM/dd/yyyy"))}").FontSize(7.5f);
                });
            });
        });
    }

    private void ComposeNotaryPublicSection(ColumnDescriptor col)
    {
        SectionHeading(col, "6. JURAT / NOTARY PUBLIC");
        var np = _app.NotaryPublic;
        col.Item().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(c =>
        {
            var dayStr = !string.IsNullOrWhiteSpace(np.SubscribedDay) ? np.SubscribedDay : "____";
            var monthYearStr = !string.IsNullOrWhiteSpace(np.SubscribedMonthYear) ? np.SubscribedMonthYear : "________";
            c.Item().Text($"SUBSCRIBED AND SWORN to before me this {dayStr} day of {monthYearStr}, affiant exhibiting competent evidence of identity.").FontSize(7.5f);

            c.Item().PaddingTop(6).Row(r =>
            {
                r.RelativeItem().Column(sc =>
                {
                    sc.Item().Text($"Doc. No.:  {(!string.IsNullOrWhiteSpace(np.DocNo) ? np.DocNo : "____")}").FontSize(7.5f);
                    sc.Item().Text($"Page No.: {(!string.IsNullOrWhiteSpace(np.PageNo) ? np.PageNo : "____")}").FontSize(7.5f);
                    sc.Item().Text($"Book No.: {(!string.IsNullOrWhiteSpace(np.BookNo) ? np.BookNo : "____")}").FontSize(7.5f);
                    sc.Item().Text($"Series of: {(!string.IsNullOrWhiteSpace(np.SeriesOf) ? np.SeriesOf : DateTime.Now.Year.ToString())}").FontSize(7.5f);
                });

                r.ConstantItem(220).Column(sc =>
                {
                    sc.Item().PaddingTop(12).LineHorizontal(0.5f).LineColor(Colors.Black);
                    sc.Item().AlignCenter().Text("NOTARY PUBLIC").FontSize(8).Bold();
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
