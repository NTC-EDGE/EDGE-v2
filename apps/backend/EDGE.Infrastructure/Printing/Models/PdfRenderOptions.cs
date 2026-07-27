namespace EDGE.Infrastructure.Printing.Models;

public sealed record PdfRenderOptions(
    bool Flatten = true,
    bool Compress = true,
    bool ValidateFieldNames = true,
    bool ThrowOnMissingFields = false,
    OverlayDebugOptions? DebugOptions = null);
