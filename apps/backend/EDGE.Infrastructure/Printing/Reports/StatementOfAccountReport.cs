using System;
using System.IO;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Statement of Account / Cashier's Assessment document for National Telecommunications Commission.
/// Renders an exact replica of the official NTC soa-report-template.pdf accountable form on standard A4 portrait.
/// Supports both full electronic form rendering (with vector seals, logos, DICT headers, payor metadata,
/// transaction checkboxes, assessment grid, OR stamps, and signatures) and blank physical accountable form overlay.
/// </summary>
public class StatementOfAccountReport : IDocument
{
    private readonly StatementOfAccountModel _model;

    public StatementOfAccountReport(StatementOfAccountModel? model = null)
    {
        _model = model ?? new StatementOfAccountModel();
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        bool isOverlay = _model.IsAccountableFormOverlay;
        var borderColor = isOverlay ? Colors.Transparent : Colors.Black;
        float outerBorderWidth = isOverlay ? 0f : 1.5f;
        float innerBorderWidth = isOverlay ? 0f : 0.6f;

        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(24);
            page.MarginVertical(20);
            page.DefaultTextStyle(x => x.FontSize(8f).FontFamily(Fonts.Arial));

            page.Content().Column(col =>
            {
                // 1. Official Header (Logos, DICT / NTC title)
                if (!isOverlay)
                {
                    col.Item().Element(ComposeHeader);
                    col.Item().PaddingTop(4).Element(ComposePayorAndMetadata);
                    col.Item().PaddingTop(3).Element(ComposeTransactionTypes);
                    col.Item().PaddingTop(4);
                }
                else
                {
                    // In overlay mode, keep reserved vertical space for pre-printed stationery
                    col.Item().Height(95).Element(ComposeOverlayMetadata);
                }

                // 2. Main Official Grid matching soa-report-template.pdf
                col.Item().Border(outerBorderWidth).BorderColor(borderColor).Table(table =>
                {
                    table.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(75);  // Column 1: Code
                        cd.RelativeColumn(1f);  // Column 2: Description
                        cd.ConstantColumn(165); // Column 3: Cashier's Report / Amount
                    });

                    // --- HEADER ROW ---
                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(4)
                        .Text(isOverlay ? "" : "Code").Bold().FontSize(8.5f);

                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(4)
                        .Text(isOverlay ? "" : "Description").Bold().FontSize(8.5f);

                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(3).Column(c =>
                        {
                            if (!isOverlay)
                            {
                                c.Item().AlignCenter().Text("CASHIER'S REPORT").Bold().FontSize(8.5f);
                            }
                            else
                            {
                                c.Item().Height(10);
                            }

                            c.Item().PaddingTop(1).Row(r =>
                            {
                                if (!isOverlay)
                                {
                                    r.AutoItem().Text("MONTH OF ").Bold().FontSize(8f);
                                }
                                var monthStr = !string.IsNullOrWhiteSpace(_model.MonthOf)
                                    ? _model.MonthOf.ToUpperInvariant()
                                    : (!string.IsNullOrWhiteSpace(_model.Date) ? _model.Date.ToUpperInvariant() : DateTime.UtcNow.ToString("MMMM yyyy").ToUpperInvariant());

                                if (!isOverlay)
                                {
                                    r.RelativeItem().BorderBottom(0.6f).BorderColor(Colors.Black).AlignCenter()
                                        .Text(monthStr).Bold().FontSize(8f);
                                }
                                else
                                {
                                    r.RelativeItem().AlignCenter().Text(monthStr).Bold().FontSize(8f);
                                }
                            });
                        });

                    // --- 1. FOR LICENSES SECTION ---
                    RenderSectionBanner(table, "FOR LICENSES", isOverlay, innerBorderWidth, borderColor);
                    RenderCategoryItems(table, SoaCategory.Licenses, isOverlay, innerBorderWidth, borderColor);

                    // --- 2. FOR PERMITS SECTION ---
                    RenderSectionBanner(table, "FOR PERMITS", isOverlay, innerBorderWidth, borderColor);
                    RenderCategoryItems(table, SoaCategory.Permits, isOverlay, innerBorderWidth, borderColor);

                    // --- 3. FOR AMATUER AND ROC SECTION ---
                    RenderSectionBanner(table, "FOR AMATUER AND ROC", isOverlay, innerBorderWidth, borderColor);
                    RenderCategoryItems(table, SoaCategory.AmateurRoc, isOverlay, innerBorderWidth, borderColor);

                    // --- 4. OTHER APPLICATION SECTION ---
                    RenderSectionBanner(table, "OTHER APPLICATION", isOverlay, innerBorderWidth, borderColor);
                    RenderCategoryItems(table, SoaCategory.OtherApplication, isOverlay, innerBorderWidth, borderColor);

                    // --- TOTAL ROW ---
                    table.Cell().ColumnSpan(2).Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignRight().AlignMiddle().Padding(4).PaddingRight(10)
                        .Text(isOverlay ? "" : "TOTAL").Bold().FontSize(9.5f);

                    string totalText = _model.TotalAmount.HasValue && _model.TotalAmount.Value > 0
                        ? _model.TotalAmount.Value.ToString("N2")
                        : string.Empty;

                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignRight().AlignMiddle().Padding(4).PaddingRight(8)
                        .Text(totalText).Bold().FontSize(9.5f);
                });

                // 3. Official Signatures and Notes Section
                col.Item().PaddingTop(6).Element(container => ComposeBottomSection(container, isOverlay));
            });
        });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Row(row =>
        {
            // Left: Republic Seal
            row.ConstantItem(48).Height(48).Element(e => RenderLogo(e, "ph-seal.png", "REPUBLIC SEAL"));

            // Center: Department and Commission Title
            row.RelativeItem().Column(c =>
            {
                c.Item().AlignCenter().Text("Republic of the Philippines")
                    .FontSize(8f).FontFamily(Fonts.TimesNewRoman);

                c.Item().AlignCenter().Text("Department of Information and Communications Technology")
                    .FontSize(7.5f).FontFamily(Fonts.TimesNewRoman);

                c.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS COMMISSION")
                    .FontSize(10f).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.02f);

                c.Item().AlignCenter().Text("Regional Office No. VII, Mandaue City, Cebu")
                    .FontSize(7.5f).FontFamily(Fonts.Arial).Italic();

                c.Item().PaddingTop(2).AlignCenter().Text("STATEMENT OF ACCOUNT")
                    .FontSize(12f).FontFamily(Fonts.Arial).Bold().LetterSpacing(0.04f);
            });

            // Right: NTC Emblem
            row.ConstantItem(48).Height(48).Element(e => RenderLogo(e, "ntc-Logo.png", "NTC SEAL"));
        });
    }

    private void ComposePayorAndMetadata(IContainer container)
    {
        container.Border(0.8f).BorderColor(Colors.Black).Padding(4).Row(row =>
        {
            // Left Side: Payor Info
            row.RelativeItem(0.65f).Column(c =>
            {
                c.Item().Row(r =>
                {
                    r.AutoItem().Text("PAYOR: ").Bold().FontSize(8.5f);
                    r.RelativeItem().Text(_model.PayorName ?? "N/A").Bold().FontSize(8.5f);
                });

                c.Item().PaddingTop(1).Row(r =>
                {
                    r.AutoItem().Text("ACCOUNT / REF NO.: ").FontSize(7.5f);
                    r.RelativeItem().Text(_model.AccountNo ?? string.Empty).FontSize(7.5f);
                });
            });

            // Right Side: Date & Due Date
            row.RelativeItem(0.35f).Column(c =>
            {
                c.Item().Row(r =>
                {
                    r.AutoItem().Text("DATE: ").Bold().FontSize(8f);
                    r.RelativeItem().Text(_model.Date ?? DateTime.UtcNow.ToString("MMMM dd, yyyy")).FontSize(8f);
                });

                if (!string.IsNullOrWhiteSpace(_model.PaymentDueDate))
                {
                    c.Item().PaddingTop(1).Row(r =>
                    {
                        r.AutoItem().Text("DUE DATE: ").Bold().FontSize(8f);
                        r.RelativeItem().Text(_model.PaymentDueDate).FontSize(8f);
                    });
                }
            });
        });
    }

    private void ComposeTransactionTypes(IContainer container)
    {
        container.Border(0.6f).BorderColor(Colors.Grey.Medium).Padding(2).Row(r =>
        {
            r.AutoItem().PaddingRight(4).Text("TYPE:").Bold().FontSize(7.5f);

            RenderCheckbox(r, "NEW", _model.IsNew);
            RenderCheckbox(r, "MOD", _model.IsMod);
            RenderCheckbox(r, "CO", _model.IsCo);
            RenderCheckbox(r, "MA", _model.IsMa);
            RenderCheckbox(r, "REN", _model.IsRen);
            RenderCheckbox(r, "DUP", _model.IsDup);
            RenderCheckbox(r, "CV", _model.IsCv);
            RenderCheckbox(r, "ROC", _model.IsRoc);
            RenderCheckbox(r, "OTHERS", _model.IsOthers || _model.IsOthersRroca || _model.IsMs);
        });
    }

    private void ComposeOverlayMetadata(IContainer container)
    {
        // When printing over physical pre-printed form, only output dynamic strings at target heights
        container.Column(col =>
        {
            col.Item().PaddingTop(18).Row(r =>
            {
                r.RelativeItem(0.6f).PaddingLeft(45).Text(_model.PayorName ?? "").Bold().FontSize(9f);
                r.RelativeItem(0.4f).AlignRight().Text(_model.Date ?? "").FontSize(8.5f);
            });

            col.Item().PaddingTop(12).Row(r =>
            {
                r.RelativeItem(0.6f).PaddingLeft(65).Text(_model.AccountNo ?? "").FontSize(8f);
                r.RelativeItem(0.4f).AlignRight().Text(_model.PaymentDueDate ?? "").FontSize(8f);
            });
        });
    }

    private static void RenderCheckbox(RowDescriptor row, string label, bool isChecked)
    {
        row.AutoItem().PaddingHorizontal(3).Row(c =>
        {
            c.AutoItem().Text(isChecked ? "[✔]" : "[ ]").Bold().FontSize(7.5f);
            c.AutoItem().PaddingLeft(1).Text(label).FontSize(7.5f);
        });
    }

    private void ComposeBottomSection(IContainer container, bool isOverlay)
    {
        container.Row(row =>
        {
            // Left column: Notes & OR Stamp box
            row.RelativeItem(0.55f).Column(c =>
            {
                if (!isOverlay)
                {
                    c.Item().Text("NOTES / REMARKS:").Bold().FontSize(7f);
                    c.Item().Text(_model.Remarks).FontSize(6.5f).FontColor(Colors.Grey.Darken2);
                }

                // Official Receipt Stamp Box
                c.Item().PaddingTop(4).Border(isOverlay ? 0f : 0.8f).BorderColor(Colors.Black).Padding(3).Column(stamp =>
                {
                    if (!isOverlay)
                    {
                        stamp.Item().AlignCenter().Text("OFFICIAL RECEIPT STAMP").Bold().FontSize(7f);
                    }

                    stamp.Item().Row(r =>
                    {
                        if (!isOverlay) r.AutoItem().Text("O.R. NO.: ").FontSize(7f);
                        r.RelativeItem().Text(_model.OrNo ?? string.Empty).Bold().FontSize(7.5f);

                        if (!isOverlay) r.AutoItem().PaddingLeft(4).Text("AMOUNT: ").FontSize(7f);
                        r.RelativeItem().Text(_model.OrAmount ?? string.Empty).Bold().FontSize(7.5f);
                    });

                    stamp.Item().PaddingTop(1).Row(r =>
                    {
                        if (!isOverlay) r.AutoItem().Text("DATE: ").FontSize(7f);
                        r.RelativeItem().Text(_model.OrDate ?? string.Empty).FontSize(7f);

                        if (!isOverlay) r.AutoItem().PaddingLeft(4).Text("BY: ").FontSize(7f);
                        r.RelativeItem().Text(_model.OrBy ?? string.Empty).FontSize(7f);
                    });
                });
            });

            // Right column: Signatures & Assessment Status
            row.RelativeItem(0.45f).PaddingLeft(12).Column(c =>
            {
                if (!isOverlay)
                {
                    c.Item().Row(statusRow =>
                    {
                        statusRow.AutoItem().Text(_model.IsForAssessmentOnly ? "[✔]" : "[ ]").Bold().FontSize(7.5f);
                        statusRow.AutoItem().PaddingLeft(2).Text("FOR ASSESSMENT ONLY").FontSize(7.5f);

                        statusRow.AutoItem().PaddingLeft(8).Text(_model.IsEndorsedForPayment ? "[✔]" : "[ ]").Bold().FontSize(7.5f);
                        statusRow.AutoItem().PaddingLeft(2).Text("ENDORSED FOR PAYMENT").FontSize(7.5f);
                    });
                }

                // Evaluator Signature Line
                c.Item().PaddingTop(12).Column(sig =>
                {
                    if (!isOverlay)
                    {
                        sig.Item().Text("PREPARED / EVALUATED BY:").FontSize(7f);
                    }
                    sig.Item().PaddingTop(isOverlay ? 8 : 12).LineHorizontal(isOverlay ? 0f : 0.8f).LineColor(Colors.Black);
                    sig.Item().AlignCenter().Text(_model.PreparedByName ?? "EVALUATOR").Bold().FontSize(8f);
                    if (!isOverlay)
                    {
                        sig.Item().AlignCenter().Text(_model.PreparedByTitle).FontSize(6.5f).Italic();
                    }
                });

                // Approved By Signature Line
                c.Item().PaddingTop(8).Column(sig =>
                {
                    if (!isOverlay)
                    {
                        sig.Item().Text("APPROVED BY:").FontSize(7f);
                    }
                    sig.Item().PaddingTop(isOverlay ? 8 : 12).LineHorizontal(isOverlay ? 0f : 0.8f).LineColor(Colors.Black);
                    sig.Item().AlignCenter().Text(_model.ApprovedByName ?? "CHIEF, EOD").Bold().FontSize(8f);
                    if (!isOverlay)
                    {
                        sig.Item().AlignCenter().Text(_model.ApprovedByTitle).FontSize(6.5f).Italic();
                    }
                });
            });
        });
    }

    private static void RenderSectionBanner(TableDescriptor table, string title, bool isOverlay, float borderWidth, string borderColor)
    {
        table.Cell().ColumnSpan(3).Border(borderWidth).BorderColor(borderColor)
            .AlignCenter().AlignMiddle().PaddingVertical(2)
            .Text(isOverlay ? "" : title).Bold().FontSize(8f);
    }

    private void RenderCategoryItems(TableDescriptor table, SoaCategory category, bool isOverlay, float borderWidth, string borderColor)
    {
        var categoryItems = _model.Items.Where(i => i.Category == category).ToList();

        foreach (var item in categoryItems)
        {
            // Column 1: Code
            table.Cell().Border(borderWidth).BorderColor(borderColor)
                .AlignLeft().AlignMiddle().PaddingVertical(2f).PaddingHorizontal(3)
                .Text(isOverlay ? "" : item.Code).FontSize(7.5f);

            // Column 2: Description (May be multi-line for surcharges)
            table.Cell().Border(borderWidth).BorderColor(borderColor)
                .AlignLeft().AlignMiddle().PaddingVertical(2f).PaddingHorizontal(3)
                .Text(isOverlay ? "" : item.Description).FontSize(7.5f);

            // Column 3: Amount (Right aligned)
            decimal? feeVal = item.Particular1.Fees;
            if (feeVal == null || feeVal == 0)
            {
                feeVal = item.SubTotal;
            }

            string amountStr = feeVal.HasValue && feeVal.Value > 0
                ? feeVal.Value.ToString("N2")
                : string.Empty;

            table.Cell().Border(borderWidth).BorderColor(borderColor)
                .AlignRight().AlignMiddle().PaddingVertical(2f).PaddingHorizontal(6)
                .Text(amountStr).FontSize(8f).Bold();
        }
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
