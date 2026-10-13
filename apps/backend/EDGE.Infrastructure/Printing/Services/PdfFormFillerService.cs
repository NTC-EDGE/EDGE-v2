using System;
using System.Collections.Generic;
using System.IO;

using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Rendering;
using EDGE.Infrastructure.Printing.Services.Templates;
using Microsoft.Extensions.Configuration;
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
    /// Overlays declarative field bindings onto a PDF template with optional debug rendering.
    /// </summary>
    byte[] OverlayFields(byte[] templateBytes, IReadOnlyList<FieldOverlay> fieldOverlays, OverlayDebugOptions? debugOptions = null);

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
    private readonly IConfiguration? _configuration;
    private readonly IPdfTemplateProvider _templateProvider;
    private readonly IPdfRendererFactory _rendererFactory;
    private readonly PdfFieldRenderer _fieldRenderer;

    public PdfFormFillerService(
        IConfiguration? configuration = null,
        IPdfTemplateProvider? templateProvider = null,
        IPdfRendererFactory? rendererFactory = null)
    {
        _configuration = configuration;
        _templateProvider = templateProvider ?? new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(new EDGE.Infrastructure.Options.CloudflareR2Options()),
            Microsoft.Extensions.Logging.Abstractions.NullLogger<CloudflareR2PdfTemplateProvider>.Instance);
        _fieldRenderer = new PdfFieldRenderer();

        if (rendererFactory == null)
        {
            var renderers = new IPdfRenderer[]
            {
                new OverlayPdfRenderer(_fieldRenderer),
                new FillablePdfRenderer()
            };
            _rendererFactory = new PdfRendererFactory(renderers);
        }
        else
        {
            _rendererFactory = rendererFactory;
        }
    }

    public string? ResolveTemplatePath(string templateName)
    {
        var fileName = templateName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? templateName : $"{templateName}.pdf";
        var candidatePaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "templates", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "templates", fileName),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "templates", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "templates", fileName)
        };

        foreach (var path in candidatePaths)
        {
            if (File.Exists(path))
            {
                return Path.GetFullPath(path);
            }
        }

        return null;
    }

    public bool TemplateExists(string templateName)
    {
        return _templateProvider.TemplateExistsAsync(templateName).GetAwaiter().GetResult();
    }

    public byte[]? GetTemplate(string templateName)
    {
        var resourceTask = _templateProvider.GetTemplateResourceAsync(templateName);
        var resource = resourceTask.GetAwaiter().GetResult();

        if (resource == null)
        {
            return null;
        }

        using (resource)
        using (var ms = new MemoryStream())
        {
            resource.Stream.CopyTo(ms);
            return ms.ToArray();
        }
    }

    public byte[] FillAcroForm(byte[] templateBytes, IDictionary<string, string> fieldValues)
    {
        using var inputStream = new MemoryStream(templateBytes);
        using var document = PdfReader.Open(inputStream, PdfDocumentOpenMode.Modify);

        if (document.AcroForm != null)
        {
            foreach (var kvp in fieldValues)
            {
                if (document.AcroForm.Fields.Names.Contains(kvp.Key))
                {
                    var field = document.AcroForm.Fields[kvp.Key];
                    if (field is PdfTextField textField)
                    {
                        textField.Value = new PdfString(kvp.Value);
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

    public byte[] OverlayFields(byte[] templateBytes, IReadOnlyList<FieldOverlay> fieldOverlays, OverlayDebugOptions? debugOptions = null)
    {
        using var inputStream = new MemoryStream(templateBytes);
        var resolvedDebugOptions = ResolveDebugOptions(debugOptions);
        var renderOptions = new PdfRenderOptions(DebugOptions: resolvedDebugOptions);

        var renderer = _rendererFactory.Resolve(RenderingStrategy.Overlay);
        var streamTask = renderer.RenderAsync(inputStream, fieldOverlays, renderOptions);
        using var resultStream = streamTask.GetAwaiter().GetResult();

        if (resultStream is MemoryStream msResult)
        {
            return msResult.ToArray();
        }

        using var copyStream = new MemoryStream();
        resultStream.CopyTo(copyStream);
        return copyStream.ToArray();
    }

    private OverlayDebugOptions ResolveDebugOptions(OverlayDebugOptions? debugOptions)
    {
        if (debugOptions != null)
        {
            return debugOptions;
        }

        if (_configuration != null)
        {
            var configSection = _configuration.GetSection("Printing:DebugOverlay");
            if (configSection.Exists())
            {
                var options = new OverlayDebugOptions();
                configSection.Bind(options);
                return options;
            }
        }

        return new OverlayDebugOptions { Enabled = false };
    }
}
