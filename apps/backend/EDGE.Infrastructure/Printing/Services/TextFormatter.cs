using System.Globalization;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services;

public static class TextFormatter
{
    public static string Apply(string value, PdfField field)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return field.TextTransform switch
        {
            TextTransform.Uppercase => value.ToUpperInvariant(),

            TextTransform.Lowercase => value.ToLowerInvariant(),

            TextTransform.TitleCase => CultureInfo.CurrentCulture.TextInfo
                .ToTitleCase(value.ToLowerInvariant()),

            TextTransform.None or _ => value
        };
    }
}
