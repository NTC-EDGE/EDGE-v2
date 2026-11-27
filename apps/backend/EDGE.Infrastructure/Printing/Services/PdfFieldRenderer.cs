using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Renderers;

namespace EDGE.Infrastructure.Printing.Services;

public class PdfFieldRenderer
{
    private readonly List<IFieldTypeRenderer> _renderers;

    public PdfFieldRenderer()
    {
        _renderers = new List<IFieldTypeRenderer>
        {
            new TextFieldRenderer(),
            new CheckboxFieldRenderer(),
            new ImageFieldRenderer()
        };
    }

    public PdfFieldRenderer(IEnumerable<IFieldTypeRenderer> renderers)
    {
        _renderers = renderers.ToList();
    }

    public void RenderOverlays(PdfRenderingContext context, IReadOnlyList<FieldOverlay> overlays)
    {
        if (overlays == null || overlays.Count == 0)
            return;

        if (context == null)
            throw new NullReferenceException("PdfRenderingContext cannot be null.");

        var sortedOverlays = overlays.OrderBy(o => o.ZIndex).ToList();

        foreach (var overlay in sortedOverlays)
        {
            if (overlay == null || overlay.Field == null) continue;
            try
            {
                var renderer = _renderers.FirstOrDefault(r => r.CanRender(overlay));
                renderer?.Render(context, overlay);

                PdfOverlayDebugRenderer.RenderFieldDebug(context, overlay);
            }
            catch
            {
                // Never abort rendering an official NTC PDF form because of a single malformed field overlay
            }
        }
    }
}
