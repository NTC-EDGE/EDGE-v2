using PdfSharp.Drawing;

namespace EDGE.Infrastructure.Printing.Models;

public sealed record PdfRenderingContext(
    XGraphics Graphics,
    OverlayDebugOptions DebugOptions);
