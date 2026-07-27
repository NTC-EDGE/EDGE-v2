using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Renderers;

public interface IFieldTypeRenderer
{
    bool CanRender(FieldOverlay overlay);
    void Render(PdfRenderingContext context, FieldOverlay overlay);
}
