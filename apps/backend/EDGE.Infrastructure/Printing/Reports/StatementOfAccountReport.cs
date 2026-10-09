using System;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Statement of Account / Cashier's Assessment document for National Telecommunications Commission.
/// Renders an exact replica of the official NTC soa-report-template.pdf accountable form on standard A4 portrait.
/// Supports both full electronic form rendering and blank physical accountable form overlay.
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
        float outerBorderWidth = isOverlay ? 0f : 2.0f;
        float innerBorderWidth = isOverlay ? 0f : 0.8f;

        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(32);
            page.MarginVertical(28);
            page.DefaultTextStyle(x => x.FontSize(8.5f).FontFamily(Fonts.Arial));

            page.Content().Column(col =>
            {
                // Main Official Grid matching soa-report-template.pdf
                col.Item().Border(outerBorderWidth).BorderColor(borderColor).Table(table =>
                {
                    table.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(80);  // Column 1: Code
                        cd.RelativeColumn(1f);  // Column 2: Description
                        cd.ConstantColumn(165); // Column 3: Cashier's Report / Amount
                    });

                    // --- HEADER ROW ---
                    // 1. Code Header
                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(6)
                        .Text(isOverlay ? "" : "Code").Bold().FontSize(10f);

                    // 2. Description Header
                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(6)
                        .Text(isOverlay ? "" : "Description").Bold().FontSize(10f);

                    // 3. Cashier's Report & Month Of Header
                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignCenter().AlignMiddle().Padding(4).Column(c =>
                        {
                            if (!isOverlay)
                            {
                                c.Item().AlignCenter().Text("CASHIER'S REPORT").Bold().FontSize(9f);
                            }
                            else
                            {
                                c.Item().Height(12);
                            }

                            c.Item().PaddingTop(2).Row(r =>
                            {
                                if (!isOverlay)
                                {
                                    r.AutoItem().Text("MONTH OF ").Bold().FontSize(8.5f);
                                }
                                var monthStr = !string.IsNullOrWhiteSpace(_model.MonthOf)
                                    ? _model.MonthOf.ToUpperInvariant()
                                    : (!string.IsNullOrWhiteSpace(_model.Date) ? _model.Date.ToUpperInvariant() : DateTime.UtcNow.ToString("MMMM yyyy").ToUpperInvariant());

                                if (!isOverlay)
                                {
                                    r.RelativeItem().BorderBottom(0.8f).BorderColor(Colors.Black).AlignCenter()
                                        .Text(monthStr).Bold().FontSize(8.5f);
                                }
                                else
                                {
                                    r.RelativeItem().AlignCenter().Text(monthStr).Bold().FontSize(8.5f);
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
                        .AlignRight().AlignMiddle().Padding(4).PaddingRight(12)
                        .Text(isOverlay ? "" : "TOTAL").Bold().FontSize(10.5f);

                    string totalText = _model.TotalAmount.HasValue && _model.TotalAmount.Value > 0
                        ? _model.TotalAmount.Value.ToString("N2")
                        : string.Empty;

                    table.Cell().Border(innerBorderWidth).BorderColor(borderColor)
                        .AlignRight().AlignMiddle().Padding(4).PaddingRight(10)
                        .Text(totalText).Bold().FontSize(10f);
                });
            });
        });
    }

    private static void RenderSectionBanner(TableDescriptor table, string title, bool isOverlay, float borderWidth, string borderColor)
    {
        table.Cell().ColumnSpan(3).Border(borderWidth).BorderColor(borderColor)
            .AlignCenter().AlignMiddle().PaddingVertical(3)
            .Text(isOverlay ? "" : title).Bold().FontSize(9f);
    }

    private void RenderCategoryItems(TableDescriptor table, SoaCategory category, bool isOverlay, float borderWidth, string borderColor)
    {
        var categoryItems = _model.Items.Where(i => i.Category == category).ToList();

        foreach (var item in categoryItems)
        {
            // Column 1: Code
            table.Cell().Border(borderWidth).BorderColor(borderColor)
                .AlignLeft().AlignMiddle().PaddingVertical(2.5f).PaddingHorizontal(4)
                .Text(isOverlay ? "" : item.Code).FontSize(8.2f);

            // Column 2: Description (May be multi-line for surcharges)
            table.Cell().Border(borderWidth).BorderColor(borderColor)
                .AlignLeft().AlignMiddle().PaddingVertical(2.5f).PaddingHorizontal(4)
                .Text(isOverlay ? "" : item.Description).FontSize(8.2f);

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
                .AlignRight().AlignMiddle().PaddingVertical(2.5f).PaddingHorizontal(6)
                .Text(amountStr).FontSize(8.5f).Bold();
        }
    }
}
