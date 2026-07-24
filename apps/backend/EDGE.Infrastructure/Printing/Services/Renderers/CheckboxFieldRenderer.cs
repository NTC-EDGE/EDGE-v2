using EDGE.Infrastructure.Printing.Models;
using PdfSharp.Drawing;

namespace EDGE.Infrastructure.Printing.Services.Renderers;

public class CheckboxFieldRenderer : IFieldTypeRenderer
{
    public bool CanRender(FieldOverlay overlay) => overlay is CheckboxFieldOverlay;

    public void Render(PdfRenderingContext context, FieldOverlay overlay)
    {
        if (overlay is not CheckboxFieldOverlay checkboxOverlay || !checkboxOverlay.IsChecked)
            return;

        var field = checkboxOverlay.Field;
        double size = 3.2;
        double cx = field.X + 3.0;
        double cy = field.Y - 3.2; // Vertically centered inside checkbox frame

        switch (checkboxOverlay.Style)
        {
            case CheckboxStyle.Checkmark:
                var pen = new XPen(XColors.Black, 1.4);
                var p1 = new XPoint(cx - (size * 0.75), cy - (size * 0.1));
                var p2 = new XPoint(cx - (size * 0.2), cy + (size * 0.75));
                var p3 = new XPoint(cx + (size * 0.85), cy - (size * 0.75));

                context.Graphics.DrawLine(pen, p1, p2);
                context.Graphics.DrawLine(pen, p2, p3);
                break;

            case CheckboxStyle.X:
                var xPen = new XPen(XColors.Black, 1.4);
                context.Graphics.DrawLine(xPen, new XPoint(cx - size, cy - size), new XPoint(cx + size, cy + size));
                context.Graphics.DrawLine(xPen, new XPoint(cx - size, cy + size), new XPoint(cx + size, cy - size));
                break;

            case CheckboxStyle.FilledSquare:
                context.Graphics.DrawRectangle(XBrushes.Black, cx - size, cy - size, size * 2, size * 2);
                break;
        }
    }
}
