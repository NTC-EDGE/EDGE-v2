using System;
using System.Collections.Generic;
using System.Linq;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Rendering;

public class PdfRendererFactory : IPdfRendererFactory
{
    private readonly IEnumerable<IPdfRenderer> _renderers;

    public PdfRendererFactory(IEnumerable<IPdfRenderer> renderers)
    {
        _renderers = renderers ?? throw new ArgumentNullException(nameof(renderers));
    }

    public IPdfRenderer Resolve(RenderingStrategy strategy)
    {
        var renderer = _renderers.FirstOrDefault(r => r.Strategy == strategy);
        if (renderer == null)
        {
            throw new NotSupportedException($"No PDF renderer registered for rendering strategy '{strategy}'.");
        }

        return renderer;
    }
}
