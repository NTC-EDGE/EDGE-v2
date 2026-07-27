namespace EDGE.Infrastructure.Printing.Models;

public sealed record OverlayDebugOptions
{
    public bool Enabled { get; init; } = true;
    public bool DrawGrid { get; init; } = true;
    public bool DrawCrosshair { get; init; } = true;
    public bool DrawCoordinates { get; init; } = true;
    public bool DrawFieldNames { get; init; } = true;
    public bool DrawBoundingBoxes { get; init; } = true;
    public int GridSpacing { get; init; } = 1;
    public int MajorGridSpacing { get; init; } = 10;
}
