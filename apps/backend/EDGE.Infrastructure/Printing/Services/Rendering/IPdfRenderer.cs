using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Rendering;

public interface IPdfRenderer
{
    RenderingStrategy Strategy { get; }
    string Name { get; }
    Task<Stream> RenderAsync(
        Stream template,
        IReadOnlyCollection<FieldOverlay> overlays,
        PdfRenderOptions? options = null,
        CancellationToken cancellationToken = default);
}
