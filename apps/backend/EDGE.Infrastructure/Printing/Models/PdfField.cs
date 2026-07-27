namespace EDGE.Infrastructure.Printing.Models;

public enum HorizontalAlignment
{
    Left,
    Center,
    Right
}

public enum VerticalAlignment
{
    Top,
    Middle,
    Baseline,
    Bottom
}

public enum PdfAnchor
{
    TopLeft,
    Center,
    BaselineLeft,
    BaselineCenter
}

public enum TextTransform
{
    None,
    Uppercase,
    Lowercase,
    TitleCase,
    SentenceCase
}

public enum OverflowBehavior
{
    None,       // Draw as-is
    Clip,       // Draw only what fits
    Ellipsis,   // "..."" at the end
    Shrink,     // Reduce font size until it fits
    Wrap,       // Multiple lines
    Error       // Throw an exception
}

/// <summary>
/// Contains pure immutable layout metadata for a form field template, including position,
/// dimensions, alignment, anchor points, and default template typography.
/// </summary>
public sealed record PdfField(
    string Name,
    double X,
    double Y,
    double? Width = null,
    double? Height = null,
    HorizontalAlignment HorizontalAlignment = HorizontalAlignment.Left,
    VerticalAlignment VerticalAlignment = VerticalAlignment.Baseline,
    PdfAnchor Anchor = PdfAnchor.BaselineLeft,
    double FontSize = 8.0,
    bool IsBold = false,
    TextTransform TextTransform = TextTransform.None,
    OverflowBehavior OverflowBehavior = OverflowBehavior.None,
    double? MinFontSize = null);
