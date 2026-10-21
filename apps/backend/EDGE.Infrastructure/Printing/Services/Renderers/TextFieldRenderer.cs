using System;
using System.Globalization;
using EDGE.Infrastructure.Printing.Models;
using PdfSharp.Drawing;

namespace EDGE.Infrastructure.Printing.Services.Renderers;

public class TextFieldRenderer : IFieldTypeRenderer
{
    public bool CanRender(FieldOverlay overlay) => overlay is TextFieldOverlay;

    public void Render(PdfRenderingContext context, FieldOverlay overlay)
    {
        if (overlay is not TextFieldOverlay textOverlay ||
            string.IsNullOrWhiteSpace(textOverlay.Text))
        {
            return;
        }

        var field = textOverlay.Field;

        // Apply template-defined formatting before measuring or rendering.
        var text = TextFormatter.Apply(textOverlay.Text, field);

        var fontStyle = field.IsBold
            ? XFontStyleEx.Bold
            : XFontStyleEx.Regular;

        var font = new XFont("Arial", field.FontSize, fontStyle);

        XBrush brush = ResolveBrush(field.TextColor);

        // Multi-line field handling (e.g. details of complaint, descriptions)
        if (field.Width.HasValue && field.Height.HasValue && field.Height.Value > field.FontSize * 1.8)
        {
            RenderMultiLineText(context, text, field, font, brush);
            return;
        }

        // Single-line field handling with auto-fit to prevent overlapping adjacent fields
        double fontSize = field.FontSize;
        XSize textSize = context.Graphics.MeasureString(text, font);

        if (field.Width.HasValue && textSize.Width > field.Width.Value)
        {
            // Dynamically scale down font size (down to 5.5pt) to fit comfortably within the cell width
            while (fontSize > 5.5 && textSize.Width > field.Width.Value)
            {
                fontSize -= 0.5;
                font = new XFont("Arial", fontSize, fontStyle);
                textSize = context.Graphics.MeasureString(text, font);
            }

            // If still wider than cell width after minimum font reduction, truncate with ellipsis to prevent ANY overflow
            if (textSize.Width > field.Width.Value && text.Length > 4)
            {
                while (text.Length > 3 && context.Graphics.MeasureString(text + "...", font).Width > field.Width.Value)
                {
                    text = text[..^1];
                }
                text += "...";
                textSize = context.Graphics.MeasureString(text, font);
            }
        }

        double drawX;

        if (field.Width.HasValue)
        {
            double width = field.Width.Value;

            double boxLeft = IsCentered(field.Anchor)
                ? field.X - (width / 2.0)
                : field.X;

            drawX = field.HorizontalAlignment switch
            {
                HorizontalAlignment.Center => boxLeft + ((width - textSize.Width) / 2.0),
                HorizontalAlignment.Right  => boxLeft + (width - textSize.Width),
                _                          => boxLeft
            };
        }
        else
        {
            drawX = IsCentered(field.Anchor)
                ? field.X - (textSize.Width / 2.0)
                : field.X;
        }

        context.Graphics.DrawString(
            text,
            font,
            brush,
            new XPoint(drawX, field.Y));
    }

    private static XBrush ResolveBrush(string? textColor)
    {
        if (!string.IsNullOrWhiteSpace(textColor))
        {
            var hex = textColor.TrimStart('#');
            if (hex.Length == 6 &&
                byte.TryParse(hex[..2], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var r) &&
                byte.TryParse(hex.Substring(2, 2), NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var g) &&
                byte.TryParse(hex[4..], NumberStyles.HexNumber, CultureInfo.InvariantCulture, out var b))
            {
                return new XSolidBrush(XColor.FromArgb(r, g, b));
            }
        }

        return XBrushes.Black;
    }

    private static void RenderMultiLineText(
        PdfRenderingContext context,
        string text,
        PdfField field,
        XFont font,
        XBrush brush)
    {
        double width = field.Width!.Value;
        double height = field.Height!.Value;
        double startX = field.X;
        double currentY = field.Y;
        double lineHeight = field.FontSize * 1.25;

        // Split text by newlines and wrap words within field width
        var paragraphs = text.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n');
        foreach (var paragraph in paragraphs)
        {
            var words = paragraph.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (words.Length == 0)
            {
                currentY += lineHeight;
                if (currentY > field.Y + height) break;
                continue;
            }

            var currentLine = "";
            foreach (var word in words)
            {
                var testLine = string.IsNullOrEmpty(currentLine) ? word : $"{currentLine} {word}";
                var size = context.Graphics.MeasureString(testLine, font);
                if (size.Width <= width)
                {
                    currentLine = testLine;
                }
                else
                {
                    if (!string.IsNullOrEmpty(currentLine))
                    {
                        context.Graphics.DrawString(currentLine, font, brush, new XPoint(startX, currentY));
                        currentY += lineHeight;
                        if (currentY > field.Y + height) return;
                    }
                    currentLine = word;
                }
            }

            if (!string.IsNullOrEmpty(currentLine))
            {
                context.Graphics.DrawString(currentLine, font, brush, new XPoint(startX, currentY));
                currentY += lineHeight;
                if (currentY > field.Y + height) return;
            }
        }
    }

    private static bool IsCentered(PdfAnchor anchor) =>
        anchor is PdfAnchor.Center or PdfAnchor.BaselineCenter;
}
