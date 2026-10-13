using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Statutory Document Report (License, Permit, or Certificate).
/// Generates an official, high-fidelity Republic of the Philippines National Telecommunications Commission
/// statutory authorization document complete with headers, licensee details, technical parameters,
/// financial receipt cross-reference, legal clauses, and anti-fraud QR verification code.
/// </summary>
public class IssuedDocumentReport : IDocument
{
    private readonly IssuedDocumentModel _model;

    public IssuedDocumentReport(IssuedDocumentModel? model = null)
    {
        _model = model ?? new IssuedDocumentModel();
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(28);
            page.MarginVertical(24);
            page.DefaultTextStyle(x => x.FontSize(8f).FontFamily(Fonts.Arial));

            page.Content().Border(1.2f).BorderColor(Colors.Blue.Darken4).Padding(12).Column(col =>
            {
                // 1. Official Header
                col.Item().Element(ComposeHeader);

                // 2. Document Title
                col.Item().PaddingTop(8).Element(ComposeTitleAndControlNumbers);

                // 3. Licensee / Grantee Box
                col.Item().PaddingTop(6).Element(ComposeLicenseeBox);

                // 4. Technical & Operational Specifications
                col.Item().PaddingTop(6).Element(ComposeTechnicalParameters);

                // 5. Statutory Regulatory Authority Clause
                col.Item().PaddingTop(6).Element(ComposeLegalAuthorityClause);

                // 6. Validity & Financial Cross-Reference
                col.Item().PaddingTop(6).Element(ComposeValidityAndReceiptBox);

                // 7. Signatory & QR Verification Section
                col.Item().PaddingTop(10).Element(ComposeSignatoryAndQrSection);

                // 8. Footer Security Notice
                col.Item().PaddingTop(6).Element(ComposeFooterSecurityNotice);
            });
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            // Left: Philippine Republic Seal
            row.ConstantItem(50).Height(50).Element(e => RenderLogo(e, "ph-seal.png", "PH SEAL"));

            // Center: DICT & NTC Title
            row.RelativeItem().PaddingHorizontal(8).Column(c =>
            {
                c.Item().AlignCenter().Text("REPUBLIC OF THE PHILIPPINES")
                    .FontSize(8.5f).Bold().FontFamily(Fonts.TimesNewRoman);

                c.Item().AlignCenter().Text("DEPARTMENT OF INFORMATION AND COMMUNICATIONS TECHNOLOGY")
                    .FontSize(7.5f).FontFamily(Fonts.TimesNewRoman);

                c.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION")
                    .FontSize(11f).Bold().FontColor(Colors.Blue.Darken4);

                var officeName = !string.IsNullOrWhiteSpace(_model.RegionalOffice)
                    ? _model.RegionalOffice.ToUpperInvariant()
                    : "CENTRAL OFFICE / REGIONAL OFFICE";

                c.Item().AlignCenter().Text(officeName)
                    .FontSize(8f).Bold().FontColor(Colors.Grey.Darken2);

                c.Item().AlignCenter().Text("NTC Building, BIR Road, East Triangle, Diliman, Quezon City")
                    .FontSize(6.5f).FontColor(Colors.Grey.Darken1);
            });

            // Right: NTC Logo
            row.ConstantItem(50).Height(50).Element(e => RenderLogo(e, "ntc-Logo.png", "NTC LOGO"));
        });
    }

    private void ComposeTitleAndControlNumbers(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().AlignCenter().BorderBottom(1.5f).BorderColor(Colors.Blue.Darken4).PaddingBottom(2).Text(_model.DocumentTitle.ToUpperInvariant())
                .FontSize(13f).Bold().FontColor(Colors.Blue.Darken4).LetterSpacing(0.04f);

            col.Item().PaddingTop(3).Row(row =>
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span("FORM NO: ").Bold().FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                    t.Span(_model.FormNumber).Bold().FontSize(8f);
                });

                row.RelativeItem().AlignCenter().Text(t =>
                {
                    t.Span("LICENSE / CERT NO: ").Bold().FontSize(7.5f).FontColor(Colors.Blue.Darken3);
                    t.Span(_model.LicenseNumber ?? _model.FormNumber).Bold().FontSize(8.5f).FontColor(Colors.Blue.Darken4);
                });

                row.RelativeItem().AlignRight().Text(t =>
                {
                    t.Span("REF NO: ").Bold().FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                    t.Span(_model.ReferenceNumber ?? "N/A").FontSize(8f);
                });
            });
        });
    }

    private void ComposeLicenseeBox(IContainer container)
    {
        container.Border(0.8f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten5).Padding(6).Column(col =>
        {
            col.Item().Text("THIS HEREBY CERTIFIES AND AUTHORIZES:").FontSize(7f).Bold().FontColor(Colors.Grey.Darken2);

            col.Item().PaddingTop(2).Text(_model.LicenseeName.ToUpperInvariant())
                .FontSize(11f).Bold().FontColor(Colors.Black);

            if (!string.IsNullOrWhiteSpace(_model.CompanyName) &&
                !_model.CompanyName.Equals(_model.LicenseeName, StringComparison.OrdinalIgnoreCase))
            {
                col.Item().Text(_model.CompanyName).FontSize(8.5f).FontColor(Colors.Grey.Darken3);
            }

            col.Item().PaddingTop(1).Row(r =>
            {
                r.AutoItem().Text("ADDRESS: ").Bold().FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                r.RelativeItem().Text(_model.Address).FontSize(8f);
            });
        });
    }

    private void ComposeTechnicalParameters(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Border(0.8f).BorderColor(Colors.Blue.Darken4).Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    cd.ConstantColumn(120);
                    cd.RelativeColumn(1f);
                    cd.ConstantColumn(120);
                    cd.RelativeColumn(1f);
                });

                // Header banner
                table.Cell().ColumnSpan(4).Background(Colors.Blue.Darken4).Padding(3).AlignCenter()
                    .Text("TECHNICAL & OPERATIONAL AUTHORIZATION PARAMETERS").Bold().FontSize(7.5f).FontColor(Colors.White);

                // Row 1: Call Sign & Station Class
                AddTableCell(table, "CALL SIGN:", true);
                AddTableCell(table, !string.IsNullOrWhiteSpace(_model.CallSign) ? _model.CallSign.ToUpperInvariant() : "N/A", false, true);
                AddTableCell(table, "STATION CLASS:", true);
                AddTableCell(table, _model.StationClass ?? "Commercial Station", false);

                // Row 2: Service Type & Frequency
                AddTableCell(table, "SERVICE CATEGORY:", true);
                AddTableCell(table, _model.ServiceName ?? "Telecommunications Service", false);
                AddTableCell(table, "AUTHORIZED FREQUENCIES:", true);
                AddTableCell(table, _model.FrequencyBand ?? "As Allocated", false, true);

                // Row 3: Equipment & Location
                AddTableCell(table, "EQUIPMENT / TRANSCEIVER:", true);
                AddTableCell(table, _model.EquipmentDetails ?? "Type-Approved Equipment", false);
                AddTableCell(table, "LOCATION / SERVICE AREA:", true);
                AddTableCell(table, _model.LocationOrServiceArea ?? _model.Address, false);
            });
        });
    }

    private static void AddTableCell(TableDescriptor table, string text, bool isHeader, bool isMonospace = false)
    {
        var cell = table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1)
            .PaddingVertical(2.5f).PaddingHorizontal(4)
            .AlignMiddle()
            .Text(text)
            .FontSize(7.5f)
            .FontColor(isHeader ? Colors.Grey.Darken3 : Colors.Black);

        if (isHeader)
        {
            cell.Bold();
        }
    }

    private void ComposeLegalAuthorityClause(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().Text(
                "This authorization is issued pursuant to Act No. 3846 (The Radio Control Law), Commonwealth Act No. 146 as amended (The Public Service Act), " +
                "Republic Act No. 7925 (Public Telecommunications Policy Act of the Philippines), and the rules and regulations promulgated by the National " +
                "Telecommunications Commission. The holder is bound to comply with all technical standards, frequency assignments, operating protocols, " +
                "and statutory terms under Philippine law.")
                .FontSize(6.8f).FontColor(Colors.Grey.Darken2).Italic().Justify();
        });
    }

    private void ComposeValidityAndReceiptBox(IContainer container)
    {
        container.Border(0.8f).BorderColor(Colors.Grey.Lighten1).Table(table =>
        {
            table.ColumnsDefinition(cd =>
            {
                cd.RelativeColumn(1f);
                cd.RelativeColumn(1f);
                cd.RelativeColumn(1f);
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(4).Column(c =>
            {
                c.Item().Text("DATE ISSUED").FontSize(6.5f).Bold().FontColor(Colors.Grey.Darken2);
                c.Item().Text(_model.IssueDate.ToString("MMMM dd, yyyy")).FontSize(8.5f).Bold();
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(4).Column(c =>
            {
                c.Item().Text("DATE OF EXPIRATION").FontSize(6.5f).Bold().FontColor(Colors.Grey.Darken2);
                var expiryStr = _model.ExpiryDate.HasValue
                    ? _model.ExpiryDate.Value.ToString("MMMM dd, yyyy")
                    : "PERPETUAL / LIFETIME";
                c.Item().Text(expiryStr).FontSize(8.5f).Bold().FontColor(_model.ExpiryDate.HasValue ? Colors.Black : Colors.Green.Darken2);
            });

            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(4).Column(c =>
            {
                c.Item().Text("OFFICIAL RECEIPT NO.").FontSize(6.5f).Bold().FontColor(Colors.Grey.Darken2);
                var orStr = !string.IsNullOrWhiteSpace(_model.OfficialReceiptNumber)
                    ? _model.OfficialReceiptNumber
                    : "ELECTRONIC PAYMENT VERIFIED";
                c.Item().Text(orStr).FontSize(8.5f).Bold().FontColor(Colors.Blue.Darken3);
            });
        });
    }

    private void ComposeSignatoryAndQrSection(IContainer container)
    {
        container.Row(row =>
        {
            // Left: QR Authenticator Box
            row.ConstantItem(140).Column(c =>
            {
                c.Item().Border(0.8f).BorderColor(Colors.Blue.Darken4).Padding(4).Column(qrCol =>
                {
                    qrCol.Item().AlignCenter().Text("SECURITY VERIFICATION").FontSize(6.5f).Bold().FontColor(Colors.Blue.Darken4);
                    qrCol.Item().PaddingVertical(2).AlignCenter().Text(_model.QrVerificationCode ?? "NTC-VERIFY-SECURE").FontSize(7f).Bold();
                    qrCol.Item().AlignCenter().Text("Scan or verify at edge.ntc.gov.ph").FontSize(5.5f).FontColor(Colors.Grey.Darken1);
                });
            });

            row.RelativeItem();

            // Right: Official Signatory Box
            row.ConstantItem(180).Column(c =>
            {
                c.Item().Height(25); // Signature area
                c.Item().BorderBottom(1f).BorderColor(Colors.Black).AlignCenter().Text(_model.SignatoryName.ToUpperInvariant())
                    .FontSize(9.5f).Bold();

                c.Item().AlignCenter().Text(_model.SignatoryTitle)
                    .FontSize(7.5f).FontColor(Colors.Grey.Darken2);

                if (_model.IsAlternateIssuer && !string.IsNullOrWhiteSpace(_model.OriginalEvaluatorName))
                {
                    c.Item().AlignCenter().Text($"(Issued on behalf of {_model.OriginalEvaluatorName})")
                        .FontSize(6.5f).Italic().FontColor(Colors.Grey.Darken1);
                }
            });
        });
    }

    private void ComposeFooterSecurityNotice(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().AlignCenter().Text(
                "OFFICIAL GOVERNMENT RECORD • ISSUED THROUGH NTC EDGE AUTOMATION ENGINE • ANY ALTERATION OR ERASURE VOIDS THIS PERMIT")
                .FontSize(5.8f).Bold().FontColor(Colors.Grey.Darken2).LetterSpacing(0.02f);
        });
    }

    private static void RenderLogo(IContainer container, string filename, string placeholderLabel)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var candidates = new[]
        {
            Path.Combine(baseDir, "Printing", "Assets", "Logos", filename),
            Path.Combine(Directory.GetCurrentDirectory(), "Printing", "Assets", "Logos", filename),
            Path.Combine(baseDir, "..", "..", "..", "..", "EDGE.Infrastructure", "Printing", "Assets", "Logos", filename),
            Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Assets", "Logos", filename)
        };

        string? found = candidates.FirstOrDefault(File.Exists);

        if (!string.IsNullOrEmpty(found))
        {
            container.Image(found).FitHeight();
        }
        else
        {
            container.Border(0.6f).BorderColor(Colors.Grey.Lighten1)
                .Background(Colors.Grey.Lighten4)
                .AlignCenter().AlignMiddle()
                .Padding(2)
                .Text(placeholderLabel)
                .FontSize(5.5f)
                .Bold()
                .FontColor(Colors.Grey.Darken1);
        }
    }
}
