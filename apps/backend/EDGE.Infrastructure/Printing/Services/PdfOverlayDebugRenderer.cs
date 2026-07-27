using EDGE.Infrastructure.Printing.Models;
using PdfSharp.Drawing;

namespace EDGE.Infrastructure.Printing.Services;

public static class PdfOverlayDebugRenderer
{
    public static void RenderGrid(XGraphics gfx, double width, double height, OverlayDebugOptions options)
    {
        if (!options.Enabled || !options.DrawGrid) return;

        var minorPen = new XPen(XColor.FromArgb(50, 180, 180, 180), 0.3);
        var majorPen = new XPen(XColor.FromArgb(120, 220, 50, 50), 0.6);
        var font = new XFont("Arial", 6, XFontStyleEx.Regular);
        var textBrush = new XSolidBrush(XColor.FromArgb(180, 200, 30, 30));

        for (double x = 0; x <= width; x += options.GridSpacing)
        {
            bool isMajor = (int)Math.Round(x) % options.MajorGridSpacing == 0;
            gfx.DrawLine(isMajor ? majorPen : minorPen, x, 0, x, height);

            if (isMajor && x > 0)
            {
                gfx.DrawString($"{x:F0}", font, textBrush, new XPoint(x + 1, 8));
            }
        }

        for (double y = 0; y <= height; y += options.GridSpacing)
        {
            bool isMajor = (int)Math.Round(y) % options.MajorGridSpacing == 0;
            gfx.DrawLine(isMajor ? majorPen : minorPen, 0, y, width, y);

            if (isMajor && y > 0)
            {
                gfx.DrawString($"{y:F0}", font, textBrush, new XPoint(2, y - 2));
            }
        }
    }

    public static void RenderFieldDebug(PdfRenderingContext context, FieldOverlay overlay)
    {
        var options = context.DebugOptions;
        if (!options.Enabled) return;

        var field = overlay.Field;
        var gfx = context.Graphics;

        // 1. Draw Field Bounding Box
        if (options.DrawBoundingBoxes)
        {
            var boxPen = new XPen(XColor.FromArgb(100, 0, 120, 215), 0.5);
            if (overlay is TextFieldOverlay textOverlay && !string.IsNullOrEmpty(textOverlay.Text))
            {
                var fontStyle = field.IsBold ? XFontStyleEx.Bold : XFontStyleEx.Regular;
                var font = new XFont("Arial", field.FontSize, fontStyle);
                XSize size = gfx.MeasureString(textOverlay.Text, font);

                double drawX = (field.Anchor == PdfAnchor.BaselineCenter || field.Anchor == PdfAnchor.Center)
                    ? field.X - (size.Width / 2.0)
                    : field.X;

                gfx.DrawRectangle(boxPen, drawX, field.Y - size.Height + 1.5, size.Width, size.Height);
            }
            else if (field.Width.HasValue)
            {
                double w = field.Width.Value;
                double h = field.Height ?? field.FontSize + 2;
                double left = (field.Anchor == PdfAnchor.BaselineCenter || field.Anchor == PdfAnchor.Center)
                    ? field.X - (w / 2.0)
                    : field.X;
                gfx.DrawRectangle(boxPen, left, field.Y - h, w, h);
            }
        }

        // 2. Draw Crosshair at (field.X, field.Y)
        if (options.DrawCrosshair)
        {
            var crossPen = new XPen(XColor.FromArgb(200, 255, 0, 0), 0.5);
            gfx.DrawLine(crossPen, field.X - 4, field.Y, field.X + 4, field.Y);
            gfx.DrawLine(crossPen, field.X, field.Y - 4, field.X, field.Y + 4);
        }

        // 3. Draw Field Name & Coordinates Label
        if (options.DrawFieldNames || options.DrawCoordinates)
        {
            var labelFont = new XFont("Arial", 5.5, XFontStyleEx.Bold);
            var labelBrush = new XSolidBrush(XColor.FromArgb(220, 0, 100, 0));

            string labelText = "";
            if (options.DrawFieldNames && options.DrawCoordinates)
                labelText = $"{field.Name} ({field.X:F0},{field.Y:F0})";
            else if (options.DrawFieldNames)
                labelText = field.Name;
            else if (options.DrawCoordinates)
                labelText = $"({field.X:F0},{field.Y:F0})";

            gfx.DrawString(labelText, labelFont, labelBrush, new XPoint(field.X + 3, field.Y - 2));
        }
    }
}
