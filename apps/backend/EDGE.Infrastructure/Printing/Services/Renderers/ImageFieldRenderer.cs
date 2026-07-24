using System.IO;
using EDGE.Infrastructure.Printing.Models;
using PdfSharp.Drawing;

namespace EDGE.Infrastructure.Printing.Services.Renderers;

public class ImageFieldRenderer : IFieldTypeRenderer
{
    public bool CanRender(FieldOverlay overlay) => overlay is ImageFieldOverlay;

    public void Render(PdfRenderingContext context, FieldOverlay overlay)
    {
        if (overlay is not ImageFieldOverlay imageOverlay || imageOverlay.ImageBytes == null || imageOverlay.ImageBytes.Length == 0)
            return;

        var field = imageOverlay.Field;
        using var stream = new MemoryStream(imageOverlay.ImageBytes);
        using var image = XImage.FromStream(stream);

        double width = field.Width ?? image.PixelWidth;
        double height = field.Height ?? image.PixelHeight;

        context.Graphics.DrawImage(image, field.X, field.Y, width, height);
    }
}
