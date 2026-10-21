using System;
using System.IO;
using EDGE.Infrastructure.Printing.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using SkiaSharp;

namespace EDGE.Infrastructure.Printing.Reports;

/// <summary>
/// Printable Official Receipt (Accountable Form No. 51) for National Telecommunications Commission.
/// Single-page, pixel-accurate vector PDF rendering matching official paper receipts in both:
/// - Landscape orientation: 8.5 x 5.5 in (612 x 396 pt)
/// - Portrait orientation: 5.5 x 8.5 in (396 x 612 pt)
/// Uses tight margins (4-5 pt), expanded section heights, and translucent 12% opacity watermark.
/// </summary>
public class OfficialReceiptReport : IDocument
{
    private readonly OfficialReceiptModel _model;

    public OfficialReceiptReport(OfficialReceiptModel? model = null)
    {
        _model = model ?? new OfficialReceiptModel();
    }

    public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            if (_model.Orientation == ReceiptOrientation.Landscape)
            {
                // Landscape: 8.5 x 5.5 inches -> 612 x 396 points (STRICT SINGLE PAGE - 98% Page Coverage)
                page.Size(new PageSize(612, 396));
                page.MarginHorizontal(5);
                page.MarginVertical(4);
                page.DefaultTextStyle(x => x.FontSize(8.5f).FontFamily(Fonts.Arial));

                page.Content().Column(col =>
                {
                    col.Item().Element(ComposeLandscapeHeader);
                    col.Item().Element(ComposeLandscapePayorRow);
                    col.Item().Element(ComposeLandscapeDetailsTable);
                    col.Item().Element(ComposeLandscapeAmountInWordsRow);
                    col.Item().Element(ComposeLandscapeBottomSection);
                });
            }
            else
            {
                // Portrait: 5.5 x 8.5 inches -> 396 x 612 points (STRICT SINGLE PAGE - 96% Page Coverage)
                page.Size(new PageSize(396, 612));
                page.MarginHorizontal(5);
                page.MarginVertical(4);
                page.DefaultTextStyle(x => x.FontSize(8.5f).FontFamily(Fonts.Arial));

                page.Content().Column(col =>
                {
                    col.Item().Element(ComposePortraitHeader);
                    col.Item().PaddingTop(4).Element(ComposePortraitTopInfoBox);
                    col.Item().PaddingTop(4).Element(ComposePortraitNatureTable);
                    col.Item().PaddingTop(4).Element(ComposePortraitBottomSection);
                    col.Item().PaddingTop(4).Element(ComposeFootnote);
                });
            }
        });
    }

    // =========================================================================
    // LANDSCAPE COMPOSITION (612 x 396 pt - Fills 98% of Printable Page)
    // =========================================================================

    private void ComposeLandscapeHeader(IContainer container)
    {
        string numberColor = _model.ReceiptNumberColor ?? "#D32F2F"; // Default red for landscape receipt number

        container.Border(1.2f).BorderColor(Colors.Black).Row(row =>
        {
            // Left Header Block: Enlarged Logos & Agency Title (~68% width)
            row.RelativeItem(0.68f).Padding(3).Row(hRow =>
            {
                hRow.ConstantItem(58).Height(58).Element(e => RenderLogo(e, _model.LeftLogoPath, "ph-seal.png", "REPUBLIC SEAL"));

                hRow.RelativeItem().Column(c =>
                {
                    c.Item().AlignCenter().Text("OFFICIAL RECEIPT")
                        .FontSize(16).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.04f);

                    c.Item().AlignCenter().Text("Republic of the Philippines")
                        .FontSize(9.5f).FontFamily(Fonts.TimesNewRoman);

                    c.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS")
                        .FontSize(10.5f).FontFamily(Fonts.TimesNewRoman).Bold();

                    c.Item().AlignCenter().Text("COMMISSION")
                        .FontSize(10.5f).FontFamily(Fonts.TimesNewRoman).Bold();
                });

                hRow.ConstantItem(58).Height(58).Element(e => RenderLogo(e, _model.RightLogoPath, "ntc-logo.png", "NTC SEAL"));
            });

            // Double Vertical Line Separator (||)
            row.ConstantItem(3).BorderLeft(1f).BorderRight(1f).BorderColor(Colors.Black);

            // Right Header Block: ORIGINAL / Nº / DATE Box (~32% width)
            row.RelativeItem(0.32f).Column(box =>
            {
                box.Item().Padding(3).AlignCenter()
                    .Text(_model.CopyType)
                    .FontSize(11).Bold().LetterSpacing(0.12f);

                box.Item().BorderTop(1f).BorderColor(Colors.Black).Padding(3).Row(r =>
                {
                    r.AutoItem().Text("Nº ").FontSize(13).Bold();
                    r.RelativeItem().PaddingLeft(2)
                        .Text(_model.ReceiptNo ?? string.Empty)
                        .FontSize(14).Bold().FontColor(numberColor);
                });

                box.Item().BorderTop(1f).BorderColor(Colors.Black).Padding(3).Row(r =>
                {
                    r.AutoItem().Text("DATE: ").FontSize(9f).Bold();
                    r.RelativeItem().PaddingLeft(2)
                        .Text(_model.Date ?? string.Empty)
                        .FontSize(9f);
                });
            });
        });
    }

    private void ComposeLandscapePayorRow(IContainer container)
    {
        container.BorderLeft(1.2f).BorderRight(1.2f).BorderBottom(1.2f).BorderColor(Colors.Black)
            .PaddingHorizontal(6).PaddingVertical(3).Row(row =>
            {
                row.AutoItem().Text("PAYOR: ").FontSize(10f).Bold();
                row.RelativeItem().PaddingLeft(4)
                    .Text(_model.Payor ?? string.Empty)
                    .FontSize(11f).Bold();
            });
    }

    private void ComposeLandscapeDetailsTable(IContainer container)
    {
        container.BorderLeft(1.2f).BorderRight(1.2f).BorderBottom(1.2f).BorderColor(Colors.Black).Column(box =>
        {
            // Table Header
            box.Item().BorderBottom(1f).BorderColor(Colors.Black).Row(row =>
            {
                row.RelativeItem(0.68f).Padding(3).AlignCenter()
                    .Text("DETAILS OF PAYMENT")
                    .FontSize(9f).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.04f);

                row.RelativeItem(0.32f).BorderLeft(1f).BorderColor(Colors.Black)
                    .Padding(3).AlignCenter()
                    .Text("AMOUNT")
                    .FontSize(9f).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.04f);
            });

            // Expanded Height Table Area (205pt) with Large 185x185pt Faint 12% Translucent Watermark
            box.Item().Height(180).Layers(layers =>
            {
                // Background Faint Translucent Watermark (ONLY in Landscape mode)
                layers.Layer().AlignCenter().AlignMiddle().Element(wm =>
                {
                    RenderWatermarkEmblem(wm, _model.RightLogoPath, "ntc-logo.png");
                });

                // Foreground Table Content
                layers.PrimaryLayer().Row(row =>
                {
                    // Left Column: Items List
                    row.RelativeItem(0.68f).PaddingHorizontal(8).PaddingVertical(6).Column(c =>
                    {
                        if (_model.Items != null && _model.Items.Count > 0)
                        {
                            foreach (var item in _model.Items)
                            {
                                c.Item().PaddingBottom(3).Text(item.NatureOfCollection).FontSize(9f);
                            }
                        }
                    });

                    // Right Column: Amounts List
                    row.RelativeItem(0.32f).BorderLeft(1f).BorderColor(Colors.Black)
                        .PaddingHorizontal(10).PaddingVertical(6).Column(c =>
                        {
                            if (_model.Items != null && _model.Items.Count > 0)
                            {
                                foreach (var item in _model.Items)
                                {
                                    string amtStr = item.Amount.HasValue ? $"P{item.Amount.Value:F2}" : string.Empty;
                                    c.Item().PaddingBottom(3).AlignRight().Text(amtStr).FontSize(9f);
                                }

                            }
                        });
                });
            });

            // Dedicated Total Row aligned with table columns
            box.Item().BorderTop(1f).BorderColor(Colors.Black).Row(row =>
            {
                row.RelativeItem(0.68f).PaddingHorizontal(8).PaddingVertical(3.5f).AlignRight()
                    .Text(text =>
                    {
                        text.Span("TOTAL ").FontSize(9.5f).FontFamily(Fonts.TimesNewRoman).Bold();
                        text.Span("► ").FontSize(9.5f);
                    });

                row.RelativeItem(0.32f).BorderLeft(1f).BorderColor(Colors.Black)
                    .PaddingHorizontal(10).PaddingVertical(3.5f).AlignRight()
                    .Text(_model.TotalAmount.HasValue ? $"P{_model.TotalAmount.Value:F2}" : string.Empty)
                    .FontSize(9.5f).Bold();
            });
        });
    }

    private void ComposeLandscapeAmountInWordsRow(IContainer container)
    {
        container.BorderLeft(1.2f).BorderRight(1.2f).BorderBottom(1.2f).BorderColor(Colors.Black)
            .PaddingHorizontal(6).PaddingVertical(3).Column(c =>
            {
                c.Item().Text("Amount in Words:").FontSize(7.5f);
                c.Item().PaddingLeft(3)
                    .Text(_model.AmountInWords ?? string.Empty)
                    .FontSize(9.5f).Bold();
            });
    }

    private void ComposeLandscapeBottomSection(IContainer container)
    {
        container.BorderLeft(1.2f).BorderRight(1.2f).BorderBottom(1.2f).BorderColor(Colors.Black).Row(row =>
        {
            // Left Side: Mode of Payment and Check/Date Details (~68% width)
            row.RelativeItem(0.68f).Column(c =>
            {
                // Mode of Payment Row with Graphical Checkboxes
                c.Item().Padding(3).Row(mRow =>
                {
                    mRow.AutoItem().Text("MODE OF PAYMENT: ").FontSize(8.5f).Bold();

                    bool isCash = _model.SelectedPaymentType == PaymentType.Cash;
                    bool isCheck = _model.SelectedPaymentType == PaymentType.Check
                                   || _model.SelectedPaymentType == PaymentType.CheckOrPmo
                                   || _model.SelectedPaymentType == PaymentType.MoneyOrder;

                    mRow.RelativeItem().PaddingLeft(8).Row(cb =>
                    {
                        cb.AutoItem().Element(e => RenderGraphicalCheckbox(e, isCash, "Cash"));
                        cb.AutoItem().PaddingLeft(18).Element(e => RenderGraphicalCheckbox(e, isCheck, "Check/PMO"));
                    });
                });

                // Check/Money Order Number & Date Sub-Row
                c.Item().BorderTop(0.8f).BorderColor(Colors.Black).Row(dRow =>
                {
                    dRow.RelativeItem(0.60f).Padding(3).Column(col1 =>
                    {
                        col1.Item().Text("Check/Money Order Number:").FontSize(7.5f);
                        col1.Item().PaddingLeft(2).Text(_model.TreasuryWarrantCheckMoneyOrderInfo ?? "-").FontSize(8.5f);
                    });

                    dRow.RelativeItem(0.40f).BorderLeft(0.8f).BorderColor(Colors.Black).Padding(3).Column(col2 =>
                    {
                        col2.Item().Text("Date:").FontSize(7.5f);
                        col2.Item().PaddingLeft(2).Text(_model.DateOfTreasuryWarrantCheckMoneyOrder ?? _model.Date ?? string.Empty).FontSize(8.5f).Bold();
                    });
                });
            });

            // Right Side: Collecting Officer Signature Block (~32% width)
            row.RelativeItem(0.32f).BorderLeft(1.2f).BorderColor(Colors.Black)
                .PaddingHorizontal(4).PaddingVertical(3).Column(c =>
                {
                    // 1. Signature Graphic Space
                    c.Item().MinHeight(16).AlignCenter().AlignBottom().Element(sig =>
                    {
                        if (_model.SignatureImageBytes != null && _model.SignatureImageBytes.Length > 0)
                        {
                            sig.MaxHeight(18).Image(_model.SignatureImageBytes);
                        }
                    });

                    // 2. Officer Name ABOVE line
                    c.Item().PaddingTop(1).AlignCenter()
                        .Text(_model.CollectingOfficer ?? string.Empty)
                        .FontSize(9f).Bold().LetterSpacing(0.02f);

                    // 3. Underline Line
                    c.Item().PaddingTop(1).LineHorizontal(0.8f).LineColor(Colors.Black);

                    // 4. Officer Title BELOW line
                    c.Item().PaddingTop(1).AlignCenter()
                        .Text("COLLECTING OFFICER")
                        .FontSize(7f).LetterSpacing(0.03f);
                });
        });
    }

    // =========================================================================
    // PORTRAIT COMPOSITION (396 x 612 pt - Fills 96% of Printable Page, NO WATERMARK)
    // =========================================================================

    private void ComposePortraitHeader(IContainer container)
    {
        container.Row(row =>
        {
            // Left Seal / Logo (Enlarged to 58pt)
            row.ConstantItem(58).Height(58).Element(e => RenderLogo(e, _model.LeftLogoPath, "ph-seal.png", "REPUBLIC SEAL"));

            // Center Header Titles
            row.RelativeItem().Column(c =>
            {
                c.Item().AlignCenter().Text("OFFICIAL RECEIPT")
                    .FontSize(16).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.05f);

                c.Item().AlignCenter().Text("Republic of the Philippines")
                    .FontSize(10).FontFamily(Fonts.TimesNewRoman);

                c.Item().AlignCenter().Text("National Telecommunications")
                    .FontSize(11.5f).FontFamily(Fonts.TimesNewRoman).Bold();

                c.Item().AlignCenter().Text("Commission")
                    .FontSize(11.5f).FontFamily(Fonts.TimesNewRoman).Bold();
            });

            // Right Seal / Logo (Enlarged to 58pt)
            row.ConstantItem(58).Height(58).Element(e => RenderLogo(e, _model.RightLogoPath, "ntc-logo.png", "NTC SEAL"));
        });
    }

    private void ComposePortraitTopInfoBox(IContainer container)
    {
        string numberColor = _model.ReceiptNumberColor ?? "#3182CE"; // Default blue for portrait

        container.Border(1.2f).BorderColor(Colors.Black).Column(box =>
        {
            // Row 1: Form No & ORIGINAL
            box.Item().Row(row =>
            {
                row.RelativeItem(0.58f).Padding(4).Column(c =>
                {
                    c.Item().Text(_model.AccountableFormNo).FontSize(8.5f);
                    c.Item().Text(_model.RevisionInfo).FontSize(8f);
                });

                row.RelativeItem(0.42f).BorderLeft(1.2f).BorderColor(Colors.Black)
                    .Padding(4).AlignCenter().AlignMiddle()
                    .Text(_model.CopyType)
                    .FontSize(12).Bold().LetterSpacing(0.12f);
            });

            // Row 2: DATE & NO.
            box.Item().BorderTop(1.2f).BorderColor(Colors.Black).Row(row =>
            {
                row.RelativeItem(0.58f).PaddingHorizontal(4).PaddingVertical(3).Row(r =>
                {
                    r.AutoItem().Text("DATE ").FontSize(10f).Bold();
                    r.RelativeItem().PaddingLeft(3).Text(_model.Date ?? string.Empty).FontSize(11f).Bold();
                });

                row.RelativeItem(0.42f).BorderLeft(1.2f).BorderColor(Colors.Black)
                    .PaddingHorizontal(4).PaddingVertical(3).Row(r =>
                    {
                        r.AutoItem().Text("No. ").FontSize(12.5f).Bold();
                        r.RelativeItem().PaddingLeft(2)
                            .Text(_model.ReceiptNo ?? string.Empty)
                            .FontSize(13f).Bold().FontColor(numberColor);
                    });
            });

            // Row 3: PAYOR
            box.Item().BorderTop(1.2f).BorderColor(Colors.Black)
                .PaddingHorizontal(4).PaddingVertical(3).Row(row =>
                {
                    row.AutoItem().Text("PAYOR ").FontSize(10f).Bold();
                    row.RelativeItem().PaddingLeft(4)
                        .Text(_model.Payor ?? string.Empty)
                        .FontSize(11f).Bold();
                });
        });
    }

    private void ComposePortraitNatureTable(IContainer container)
    {
        container.Border(1.2f).BorderColor(Colors.Black).Column(box =>
        {
            // Table Header
            box.Item().BorderBottom(1.2f).BorderColor(Colors.Black).Row(row =>
            {
                row.RelativeItem(0.70f).Padding(3.5f).AlignCenter()
                    .Text("NATURE OF COLLECTION")
                    .FontSize(9f).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.04f);

                row.RelativeItem(0.30f).BorderLeft(1.2f).BorderColor(Colors.Black)
                    .Padding(3.5f).AlignCenter()
                    .Text("AMOUNT")
                    .FontSize(9f).FontFamily(Fonts.TimesNewRoman).Bold().LetterSpacing(0.04f);
            });

            // Portrait Collection Table Area (235pt height - NO WATERMARK in Portrait)
            box.Item().Height(235).Row(row =>
            {
                // Left Column: Item Descriptions
                row.RelativeItem(0.70f).PaddingHorizontal(6).PaddingVertical(5).Column(c =>
                {
                    if (_model.Items != null && _model.Items.Count > 0)
                    {
                        foreach (var item in _model.Items)
                        {
                            c.Item().PaddingBottom(3).Text(item.NatureOfCollection).FontSize(9.5f);
                        }
                    }
                });

                // Right Column: Amounts
                row.RelativeItem(0.30f).BorderLeft(1.2f).BorderColor(Colors.Black)
                    .Row(r =>
                    {
                        r.RelativeItem(0.75f).PaddingHorizontal(4).PaddingVertical(5).Column(c =>
                        {
                            if (_model.Items != null && _model.Items.Count > 0)
                            {
                                foreach (var item in _model.Items)
                                {
                                    string amtStr = item.Amount.HasValue ? $"₱ {item.Amount.Value:F2}" : string.Empty;
                                    c.Item().PaddingBottom(3).AlignRight().Text(amtStr).FontSize(9.5f);
                                }
                            }
                        });

                        r.RelativeItem(0.25f).BorderLeft(0.5f).BorderColor(Colors.Black);
                    });
            });

            // Total Row
            box.Item().BorderTop(1.2f).BorderColor(Colors.Black).Row(row =>
            {
                row.RelativeItem(0.70f).PaddingHorizontal(6).PaddingVertical(3.5f).AlignRight()
                    .Text(text =>
                    {
                        text.Span("TOTAL ").FontSize(9.5f).FontFamily(Fonts.TimesNewRoman).Bold();
                        text.Span("► ").FontSize(9.5f);
                    });

                row.RelativeItem(0.30f).BorderLeft(1.2f).BorderColor(Colors.Black).Row(r =>
                {
                    r.RelativeItem(0.75f).PaddingHorizontal(4).PaddingVertical(3.5f).AlignRight()
                        .Text(_model.TotalAmount.HasValue ? $"₱ {_model.TotalAmount.Value:F2}" : string.Empty)
                        .FontSize(9.5f).Bold();

                    r.RelativeItem(0.25f).BorderLeft(0.5f).BorderColor(Colors.Black);
                });
            });

            // Amount In Words Section
            box.Item().BorderTop(1.2f).BorderColor(Colors.Black).Padding(3.5f).Column(c =>
            {
                c.Item().Text("AMOUNT IN WORDS").FontSize(8f).FontFamily(Fonts.TimesNewRoman);
                c.Item().MinHeight(18).PaddingLeft(4).AlignMiddle()
                    .Text(_model.AmountInWords ?? string.Empty)
                    .FontSize(9.5f).Bold();
            });
        });
    }

    private void ComposePortraitBottomSection(IContainer container)
    {
        container.Border(1.2f).BorderColor(Colors.Black).Row(row =>
        {
            // Left Side: Received checkboxes & Warrant/Check details
            row.RelativeItem(0.44f).Column(c =>
            {
                c.Item().Padding(3).Row(r =>
                {
                    r.AutoItem().Text("Received").FontSize(8.5f);
                    r.RelativeItem().PaddingLeft(4).Column(cb =>
                    {
                        cb.Item().Row(chk =>
                        {
                            chk.AutoItem().Text(_model.SelectedPaymentType == PaymentType.Cash ? "[x] " : "[  ]").FontSize(8f).Bold();
                            chk.AutoItem().Text("Cash").FontSize(8f);
                        });

                        cb.Item().Row(chk =>
                        {
                            chk.AutoItem().Text(_model.SelectedPaymentType == PaymentType.TreasuryWarrant ? "[x] " : "[  ]").FontSize(8f).Bold();
                            chk.AutoItem().Text("Treasury Warrant").FontSize(8f);
                        });

                        cb.Item().Row(chk =>
                        {
                            chk.AutoItem().Text(_model.SelectedPaymentType == PaymentType.Check ? "[x] " : "[  ]").FontSize(8f).Bold();
                            chk.AutoItem().Text("Check").FontSize(8f);
                        });

                        cb.Item().Row(chk =>
                        {
                            chk.AutoItem().Text(_model.SelectedPaymentType == PaymentType.MoneyOrder ? "[x] " : "[  ]").FontSize(8f).Bold();
                            chk.AutoItem().Text("Money Order").FontSize(8f);
                        });
                    });
                });

                c.Item().BorderTop(0.8f).BorderColor(Colors.Black).Padding(3).Column(tw =>
                {
                    tw.Item().Text("Treasury Warrant, Check,\nMoney Order").FontSize(7.5f);
                    tw.Item().MinHeight(16).Text(_model.TreasuryWarrantCheckMoneyOrderInfo ?? string.Empty).FontSize(8.5f);
                });

                c.Item().BorderTop(0.8f).BorderColor(Colors.Black).Padding(3).Column(dt =>
                {
                    dt.Item().Text("Date of Treasury Warrant,\nCheck, Money Order").FontSize(7.5f);
                    dt.Item().MinHeight(14).Text(_model.DateOfTreasuryWarrantCheckMoneyOrder ?? string.Empty).FontSize(8.5f);
                });
            });

            // Right Side: Received from Amount Stated Above & Signature Block
            row.RelativeItem(0.56f).BorderLeft(1.2f).BorderColor(Colors.Black)
                .PaddingHorizontal(4).PaddingVertical(3).Column(c =>
                {
                    c.Item().Text("Received from the Amount Stated\nAbove").FontSize(8.5f);

                    c.Item().MinHeight(22).AlignCenter().AlignBottom().Element(sig =>
                    {
                        if (_model.SignatureImageBytes != null && _model.SignatureImageBytes.Length > 0)
                        {
                            sig.MaxHeight(22).Image(_model.SignatureImageBytes);
                        }
                    });

                    // 1. Officer Name (Above line)
                    c.Item().PaddingTop(1).AlignCenter()
                        .Text(_model.CollectingOfficer ?? string.Empty)
                        .FontSize(9.5f).Bold().LetterSpacing(0.02f);

                    // 2. Underline Line
                    c.Item().PaddingTop(1).LineHorizontal(0.8f).LineColor(Colors.Black);

                    // 3. Officer Title (Below line)
                    c.Item().PaddingTop(1).AlignCenter()
                        .Text("COLLECTING OFFICER")
                        .FontSize(7.5f).LetterSpacing(0.03f);
                });
        });
    }

    private void ComposeFootnote(IContainer container)
    {
        container.AlignCenter().Text("NOTE: Write the number and date of this receipt on the back of treasury warrant,\ncheck, or money order received.")
            .FontSize(7.5f).Italic();
    }

    // =========================================================================
    // HELPER RENDERERS (Graphical Checkboxes, Logos, Translucent Watermark)
    // =========================================================================

    private void RenderGraphicalCheckbox(IContainer container, bool isChecked, string label)
    {
        container.Row(r =>
        {
            r.ConstantItem(12).Height(12).Border(1f).BorderColor(Colors.Black)
                .AlignCenter().AlignMiddle()
                .Text(isChecked ? "X" : string.Empty)
                .FontSize(9f).Bold();

            r.AutoItem().PaddingLeft(4).AlignMiddle().Text(label).FontSize(8.5f);
        });
    }

    private void RenderWatermarkEmblem(IContainer container, string? customPath, string defaultFilename)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string defaultPath = Path.Combine(baseDir, "Printing", "Assets", "Logos", defaultFilename);

        string targetPath = !string.IsNullOrWhiteSpace(customPath) && File.Exists(customPath)
            ? customPath
            : (File.Exists(defaultPath) ? defaultPath : string.Empty);

        // Watermark dimension: 185 x 185 pt with 12% alpha transparency
        if (!string.IsNullOrEmpty(targetPath) && File.Exists(targetPath))
        {
            byte[] originalBytes = File.ReadAllBytes(targetPath);
            byte[] transparentBytes = ApplyTransparency(originalBytes, 0.12f); // 12% opacity / 88% transparent!

            container.Width(185).Height(185).Image(transparentBytes).FitHeight();
        }
        else
        {
            // Faint 10-15% light watermark placeholder emblem
            container.Width(185).Height(185).AlignCenter().AlignMiddle().Column(col =>
            {
                col.Item().Border(1.2f).BorderColor(Colors.Grey.Lighten3)
                    .Padding(8).Column(inner =>
                    {
                        inner.Item().AlignCenter().Text("NATIONAL TELECOMMUNICATIONS").FontSize(7.5f).FontColor(Colors.Grey.Lighten2).Bold();
                        inner.Item().AlignCenter().Text("COMMISSION").FontSize(7.5f).FontColor(Colors.Grey.Lighten2).Bold();
                    });
            });
        }
    }

    /// <summary>
    /// Uses SkiaSharp to convert image pixels to 12% opacity (88% transparent) on the fly.
    /// </summary>
    private static byte[] ApplyTransparency(byte[] imageBytes, float opacity = 0.12f)
    {
        try
        {
            using var originalBitmap = SKBitmap.Decode(imageBytes);
            if (originalBitmap == null) return imageBytes;

            using var surface = SKSurface.Create(new SKImageInfo(originalBitmap.Width, originalBitmap.Height));
            using var canvas = surface.Canvas;
            canvas.Clear(SKColors.Empty);

            using var paint = new SKPaint
            {
                Color = new SKColor(255, 255, 255, (byte)(255 * opacity))
            };

            canvas.DrawBitmap(originalBitmap, 0, 0, paint);
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            return data.ToArray();
        }
        catch
        {
            return imageBytes;
        }
    }

    private void RenderLogo(IContainer container, string? customPath, string defaultFilename, string placeholderLabel)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        string defaultPath = Path.Combine(baseDir, "Printing", "Assets", "Logos", defaultFilename);

        string targetPath = !string.IsNullOrWhiteSpace(customPath) && File.Exists(customPath)
            ? customPath
            : (File.Exists(defaultPath) ? defaultPath : string.Empty);

        if (!string.IsNullOrEmpty(targetPath) && File.Exists(targetPath))
        {
            container.Image(targetPath).FitHeight();
        }
        else
        {
            container.Border(1).BorderColor(Colors.Grey.Medium)
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
