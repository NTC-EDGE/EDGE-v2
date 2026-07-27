using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Rendering;

public interface IPdfRendererFactory
{
    IPdfRenderer Resolve(RenderingStrategy strategy);
}
