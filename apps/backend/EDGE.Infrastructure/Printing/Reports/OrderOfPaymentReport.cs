using System;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Order of Payment document for National Telecommunications Commission.
/// Renders a 2-up page (Top Half and Bottom Half duplicate copies) on standard A4 paper.
/// Supports both blank templates and populated sample/production data.
/// Features a thick outer border around each copy and enlarged O.R. amount formatting matching official physical forms.
/// </summary>
public class OrderOfPaymentReport : IDocument
{
    private readonly OrderOfPaymentModel _model;

    public OrderOfPaymentReport(OrderOfPaymentModel? model = null)
    {
        _model = model ?? new OrderOfPaymentModel();
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.MarginHorizontal(14);
            page.MarginVertical(10);
            page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Arial));

            page.Content().Column(col =>
            {
                // Top Copy (1-up) with Thick Outer Border
                col.Item().Element(ComposeSingleOrderOfPayment);

                // Compact divider spacing between Top and Bottom copies
                col.Item().PaddingVertical(6);

                // Bottom Copy (Duplicate 1-up) with Thick Outer Border
                col.Item().Element(ComposeSingleOrderOfPayment);
            });
        });
    }

    private void ComposeSingleOrderOfPayment(IContainer container)
    {
        // Enclose each Order of Payment copy in a thick outer border
        container.Border(1.8f).BorderColor(Colors.Black).Padding(8).Column(col =>
        {
            // 1. Header (Agency, Serial No, Date)
            col.Item().Row(row =>
            {
                row.RelativeItem(0.68f).Column(c =>
                {
                    c.Item().Text(_model.AgencyName)
                        .FontSize(10).Bold();

                    c.Item().Text($"Regional Office No.   {_model.RegionalOffice ?? string.Empty}")
                        .FontSize(9).Bold();

                    c.Item().PaddingTop(3).Text(_model.Fund ?? "General Fund")
                        .FontSize(9).Bold();

                    c.Item().PaddingTop(3).Text("The Collecting Officer")
                        .FontSize(9).Bold();
                });

                row.RelativeItem(0.32f).Column(c =>
                {
                    c.Item().Row(r =>
                    {
                        r.AutoItem().Text("Serial No. :  ").Bold();
                        r.RelativeItem().UnderlineText(_model.SerialNo);
                    });

                    c.Item().PaddingTop(2).Row(r =>
                    {
                        r.AutoItem().Text("Date :  ").Bold();
                        r.RelativeItem().UnderlineText(_model.Date);
                    });
                });
            });

            // 2. Document Title
            col.Item().PaddingTop(2).AlignCenter().Text(_model.Title ?? "ORDER OF PAYMENT")
                .FontSize(11).Bold();

            // 3. Payor Section
            col.Item().PaddingTop(3).Column(c =>
            {
                c.Item().Row(r =>
                {
                    r.AutoItem().Text("Please issue ").FontSize(8.5f);
                    r.AutoItem().Text("Official Receipt ").Bold().FontSize(8.5f);
                    r.AutoItem().Text("in favor of ").FontSize(8.5f);
                    r.RelativeItem().UnderlineTextCenter(_model.PayorName, bold: true);
                });
                c.Item().AlignCenter().Text("(Name of Payor)").FontSize(7.5f).Italic();

                c.Item().PaddingTop(2).UnderlineTextCenter(_model.PayorAddress, bold: true);
                c.Item().AlignCenter().Text("(Address/Office of Payor)").FontSize(7.5f).Italic();
            });

            // 4. Amount and Purpose Section
            col.Item().PaddingTop(3).Column(c =>
            {
                c.Item().Row(r =>
                {
                    r.AutoItem().Text("in the amount of ").FontSize(8.5f);
                    r.RelativeItem(0.75f).UnderlineTextCenter(_model.AmountInWords);
                    r.AutoItem().PaddingHorizontal(4).Text("PHP").Bold().FontSize(8.5f);
                    r.RelativeItem(0.25f).UnderlineTextRight(_model.Amount.HasValue ? _model.Amount.Value.ToString("N2") : string.Empty);
                });

                c.Item().PaddingTop(2).Row(r =>
                {
                    r.AutoItem().Text("for the payment of ").FontSize(8.5f);
                    r.RelativeItem().UnderlineTextCenter(_model.Purpose);
                });
                c.Item().AlignCenter().Text("(Purpose)").FontSize(7.5f).Italic();
            });

            // 5. Statement of Account Section
            col.Item().PaddingTop(3).Row(r =>
            {
                r.AutoItem().Text("per ").FontSize(8.5f);
                r.AutoItem().Text("Statement of Account No. ").Bold().FontSize(8.5f);
                r.RelativeItem(0.6f).UnderlineTextCenter(_model.StatementOfAccountNo);
                r.AutoItem().PaddingHorizontal(6).Text("dated").FontSize(8.5f);
                r.RelativeItem(0.4f).UnderlineTextCenter(_model.StatementOfAccountDate);
            });

            // 6. Bank Accounts Deposit Breakdown
            col.Item().PaddingTop(4).Column(c =>
            {
                c.Item().Text("Please deposit the collections under Bank Account/s:").FontSize(8.5f);

                c.Item().PaddingTop(1).Row(r =>
                {
                    // Left spacer / account no column
                    r.ConstantItem(125).Text("No.").FontSize(8.5f).Underline().Bold();
                    // Bank Name column
                    r.RelativeItem().AlignCenter().Text("Name of Bank").FontSize(8.5f).Underline().Bold();
                    // Amount column
                    r.ConstantItem(90).AlignRight().Text("Amount").FontSize(8.5f).Underline().Bold();
                });

                // Bank rows
                var banks = _model.BankAccounts;
                int rowCount = Math.Max(2, banks.Count);

                for (int i = 0; i < rowCount; i++)
                {
                    var bank = i < banks.Count ? banks[i] : null;

                    c.Item().PaddingTop(1).Row(r =>
                    {
                        r.ConstantItem(125).UnderlineText(bank?.No);
                        r.RelativeItem().UnderlineTextCenter(bank?.BankName);
                        r.ConstantItem(90).Row(ar =>
                        {
                            ar.AutoItem().Text("PHP ").FontSize(8.5f);
                            ar.RelativeItem().UnderlineTextRight(bank?.Amount.HasValue == true ? bank.Amount.Value.ToString("N2") : string.Empty);
                        });
                    });
                }

                // Total Row
                c.Item().PaddingTop(2).Row(r =>
                {
                    r.AutoItem().Text("TOTAL").Bold().FontSize(9);
                    r.RelativeItem();
                    r.ConstantItem(90).Row(tr =>
                    {
                        tr.AutoItem().Text("PHP ").Bold().FontSize(9);
                        tr.RelativeItem().Element(e =>
                        {
                            string val = _model.TotalAmount.HasValue ? _model.TotalAmount.Value.ToString("N2") : string.Empty;
                            e.BorderBottom(1.5f).BorderColor(Colors.Black).AlignRight().Text(val).Bold().FontSize(9);
                        });
                    });
                });
            });

            // 7. Footer: O.R. Stamp Box (Bottom Left with Enlarged Amount) & Signatures (Bottom Right)
            col.Item().PaddingTop(4).Row(r =>
            {
                // Bottom Left O.R. Stamp Box (Thick 1.2pt border with internal grid lines and enlarged amount)
                r.ConstantItem(155).Border(1.2f).BorderColor(Colors.Black).Table(orTable =>
                {
                    orTable.ColumnsDefinition(cd =>
                    {
                        cd.ConstantColumn(30); // O.R. label column
                        cd.RelativeColumn();   // Details column
                    });

                    // Left cell: "O.R." centered vertically & horizontally
                    orTable.Cell().RowSpan(4).BorderRight(0.8f).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                        .Text("O.R.").Bold().FontSize(11);

                    // Row 1: No.
                    orTable.Cell().BorderBottom(0.5f).BorderColor(Colors.Black).Padding(1.5f).Row(dr =>
                    {
                        dr.ConstantItem(38).Text("No.").FontSize(7f);
                        dr.RelativeItem().Text(_model.OrNo ?? string.Empty).FontSize(7.5f);
                    });

                    // Row 2: AMOUNT (Large prominent font size matching official form!)
                    orTable.Cell().BorderBottom(0.5f).BorderColor(Colors.Black).Padding(1.5f).Row(dr =>
                    {
                        dr.ConstantItem(38).AlignMiddle().Text("AMOUNT:").FontSize(6.5f);
                        dr.RelativeItem().AlignMiddle().Text(_model.OrAmount ?? string.Empty).Bold().FontSize(15);
                    });

                    // Row 3: Date
                    orTable.Cell().BorderBottom(0.5f).BorderColor(Colors.Black).Padding(1.5f).Row(dr =>
                    {
                        dr.ConstantItem(38).Text("Date:").FontSize(7f);
                        dr.RelativeItem().Text(_model.OrDate ?? string.Empty).FontSize(7.5f);
                    });

                    // Row 4: By
                    orTable.Cell().Padding(1.5f).Row(dr =>
                    {
                        dr.ConstantItem(38).Text("By:").FontSize(7f);
                        dr.RelativeItem().Text(_model.OrBy ?? string.Empty).FontSize(7.5f);
                    });
                });

                r.RelativeItem();

                // Bottom Right Collecting Officer Signature Line
                r.ConstantItem(270).AlignBottom().Column(sigCol =>
                {
                    sigCol.Item().LineHorizontal(0.8f).LineColor(Colors.Black);
                    if (!string.IsNullOrWhiteSpace(_model.CollectingOfficer))
                    {
                        sigCol.Item().AlignCenter().Text(_model.CollectingOfficer).FontSize(8.5f).Bold();
                    }
                });
            });
        });
    }
}

internal static class OrderOfPaymentQuestPdfHelpers
{
    public static void UnderlineText(this IContainer container, string? text, bool bold = false)
    {
        container.BorderBottom(0.5f).BorderColor(Colors.Black).PaddingHorizontal(2).Text(text ?? string.Empty).FontSize(8.5f).ApplyFont(bold);
    }

    public static void UnderlineTextCenter(this IContainer container, string? text, bool bold = false)
    {
        container.BorderBottom(0.5f).BorderColor(Colors.Black).PaddingHorizontal(2).AlignCenter().Text(text ?? string.Empty).FontSize(8.5f).ApplyFont(bold);
    }

    public static void UnderlineTextRight(this IContainer container, string? text, bool bold = false)
    {
        container.BorderBottom(0.5f).BorderColor(Colors.Black).PaddingHorizontal(2).AlignRight().Text(text ?? string.Empty).FontSize(8.5f).ApplyFont(bold);
    }

    private static TextSpanDescriptor ApplyFont(this TextSpanDescriptor descriptor, bool bold)
    {
        return bold ? descriptor.Bold() : descriptor;
    }
}

