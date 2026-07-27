using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Renderers;

public interface IImageOverlayRenderer
{
    void RenderImageOverlay(PdfRenderingContext context, ImageFieldOverlay overlay);
}
