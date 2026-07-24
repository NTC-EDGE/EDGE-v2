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

        XSize textSize = context.Graphics.MeasureString(text, font);

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
            XBrushes.Black,
            new XPoint(drawX, field.Y));
    }

    private static bool IsCentered(PdfAnchor anchor) =>
    anchor is PdfAnchor.Center or PdfAnchor.BaselineCenter;
}
