using System;
using System.Collections.Generic;
using System.IO;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using PdfSharp.Pdf.AcroForms;
using PdfSharp.Pdf.IO;

namespace EDGE.Infrastructure.Printing.Services;

public interface IPdfFormFillerService
{
    /// <summary>
    /// Fills an AcroForm PDF template using a dictionary of field names and string values.
    /// </summary>
    byte[] FillAcroForm(byte[] templateBytes, IDictionary<string, string> fieldValues);

    /// <summary>
    /// Overlays text onto an existing PDF template page at specified (X, Y) coordinates.
    /// </summary>
    byte[] OverlayText(byte[] templateBytes, IEnumerable<TextOverlayItem> textItems);

    /// <summary>
    /// Checks if a template file exists on disk in any of the template search locations.
    /// </summary>
    bool TemplateExists(string templateName);

    /// <summary>
    /// Gets template byte stream from disk if available.
    /// </summary>
    byte[]? GetTemplate(string templateName);

    /// <summary>
    /// Returns the resolved filepath of the template if it exists, or null.
    /// </summary>
    string? ResolveTemplatePath(string templateName);
}

public class TextOverlayItem
{
    public int PageIndex { get; set; } = 0;
    public string Text { get; set; } = "";
    public double X { get; set; }
    public double Y { get; set; }
    public double FontSize { get; set; } = 9;
    public bool IsBold { get; set; } = false;
}

public class PdfFormFillerService : IPdfFormFillerService
{
    public string? ResolveTemplatePath(string templateName)
    {
        var candidatePaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Printing", "Templates", templateName),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, templateName),
            Path.Combine(Directory.GetCurrentDirectory(), "Printing", "Templates", templateName),
            Path.Combine(Directory.GetCurrentDirectory(), "EDGE.Infrastructure", "Printing", "Templates", templateName),
            Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", templateName)
        };

        foreach (var path in candidatePaths)
        {
            if (File.Exists(path))
            {
                return path;
            }
        }

        return null;
    }

    public bool TemplateExists(string templateName)
    {
        return ResolveTemplatePath(templateName) != null;
    }

    public byte[]? GetTemplate(string templateName)
    {
        var resolvedPath = ResolveTemplatePath(templateName);
        return resolvedPath != null ? File.ReadAllBytes(resolvedPath) : null;
    }

    public byte[] FillAcroForm(byte[] templateBytes, IDictionary<string, string> fieldValues)
    {
        using var inputStream = new MemoryStream(templateBytes);
        using var document = PdfReader.Open(inputStream, PdfDocumentOpenMode.Modify);

        var acroForm = document.AcroForm;
        if (acroForm != null)
        {
            foreach (var kvp in fieldValues)
            {
                if (acroForm.Fields.Names.Contains(kvp.Key))
                {
                    var field = acroForm.Fields[kvp.Key];
                    if (field is PdfTextField textField)
                    {
                        textField.Text = kvp.Value;
                    }
                    else if (field is PdfCheckBoxField checkBoxField)
                    {
                        checkBoxField.Checked = kvp.Value.Equals("true", StringComparison.OrdinalIgnoreCase) ||
                                                kvp.Value.Equals("yes", StringComparison.OrdinalIgnoreCase) ||
                                                kvp.Value == "1";
                    }
                }
            }
        }

        using var outputStream = new MemoryStream();
        document.Save(outputStream);
        return outputStream.ToArray();
    }

    public byte[] OverlayText(byte[] templateBytes, IEnumerable<TextOverlayItem> textItems)
    {
        using var inputStream = new MemoryStream(templateBytes);
        using var document = PdfReader.Open(inputStream, PdfDocumentOpenMode.Modify);

        foreach (var item in textItems)
        {
            if (item.PageIndex >= 0 && item.PageIndex < document.Pages.Count)
            {
                var page = document.Pages[item.PageIndex];
                using var gfx = XGraphics.FromPdfPage(page);

                if (item.Text == "✔" || item.Text == "✓")
                {
                    // Render native vector checkmark to prevent font missing glyph (□) rendering issues in PDF viewers
                    double estimatedWidth = item.FontSize * 0.62;
                    double cx = item.X + (estimatedWidth / 2.0);
                    double cy = item.Y - 1.5;
                    double size = 3.5;

                    var pen = new XPen(XColors.Black, 1.5);
                    var p1 = new XPoint(cx - (size * 0.75), cy - (size * 0.1));
                    var p2 = new XPoint(cx - (size * 0.2), cy + (size * 0.75));
                    var p3 = new XPoint(cx + (size * 0.85), cy - (size * 0.75));

                    gfx.DrawLine(pen, p1, p2);
                    gfx.DrawLine(pen, p2, p3);
                }
                else
                {
                    var fontStyle = item.IsBold ? XFontStyleEx.Bold : XFontStyleEx.Regular;
                    var font = new XFont("Arial", item.FontSize, fontStyle);

                    gfx.DrawString(item.Text, font, XBrushes.Black, new XPoint(item.X, item.Y));
                }
            }
        }

        using var outputStream = new MemoryStream();
        document.Save(outputStream);
        return outputStream.ToArray();
    }
}
