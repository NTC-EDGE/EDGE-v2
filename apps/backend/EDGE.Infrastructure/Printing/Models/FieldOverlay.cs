namespace EDGE.Infrastructure.Printing.Models;

public enum CheckboxStyle
{
    Checkmark,
    X,
    FilledSquare
}

/// <summary>
/// Abstract base record representing an overlay binding for a field template.
/// </summary>
public abstract record FieldOverlay(
    PdfField Field,
    int ZIndex = 0);

public sealed record TextFieldOverlay(
    PdfField Field,
    string Text,
    int ZIndex = 0) : FieldOverlay(Field, ZIndex);

public sealed record CheckboxFieldOverlay(
    PdfField Field,
    bool IsChecked,
    CheckboxStyle Style = CheckboxStyle.Checkmark,
    int ZIndex = 0,
    bool DrawBox = false) : FieldOverlay(Field, ZIndex);

public sealed record ImageFieldOverlay(
    PdfField Field,
    byte[] ImageBytes,
    int ZIndex = 0) : FieldOverlay(Field, ZIndex);
