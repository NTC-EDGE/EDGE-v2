namespace EDGE.Infrastructure.Printing.Models;

public sealed record PdfTemplate(
    string Id,
    string Name,
    string ResourceName,
    RenderingStrategy Strategy,
    bool FlattenOutput = true);
