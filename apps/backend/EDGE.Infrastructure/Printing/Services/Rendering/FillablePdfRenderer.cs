using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Renderers;
using iText.Forms;
using iText.Forms.Fields;
using iText.IO.Image;
using iText.Kernel.Pdf;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Printing.Services.Rendering;

public class FillablePdfRenderer : IPdfRenderer
{
    private readonly IImageOverlayRenderer? _imageRenderer;
    private readonly ILogger<FillablePdfRenderer>? _logger;

    public RenderingStrategy Strategy => RenderingStrategy.Fillable;
    public string Name => "iText Fillable";

    public FillablePdfRenderer(IImageOverlayRenderer? imageRenderer = null, ILogger<FillablePdfRenderer>? logger = null)
    {
        _imageRenderer = imageRenderer;
        _logger = logger;
    }

    public Task<Stream> RenderAsync(
        Stream template,
        IReadOnlyCollection<FieldOverlay> overlays,
        PdfRenderOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        if (template == null)
            throw new ArgumentNullException(nameof(template));

        options ??= new PdfRenderOptions();

        if (template.CanSeek)
        {
            template.Position = 0;
        }

        var outputStream = new MemoryStream();
        var fallbackImageOverlays = new List<ImageFieldOverlay>();

        using (var reader = new PdfReader(template))
        using (var writer = new PdfWriter(outputStream))
        using (var pdfDoc = new PdfDocument(reader, writer))
        {
            var acroForm = PdfAcroForm.GetAcroForm(pdfDoc, true);
            var formFields = acroForm?.GetAllFormFields();

            if (overlays != null && formFields != null)
            {
                foreach (var overlay in overlays)
                {
                    string fieldName = overlay.Field.Name;

                    if (!formFields.TryGetValue(fieldName, out var formField))
                    {
                        string warnMsg = $"AcroForm field '{fieldName}' not found in PDF template.";
                        if (options.ThrowOnMissingFields)
                        {
                            throw new KeyNotFoundException(warnMsg);
                        }
                        _logger?.LogWarning("{WarningMessage}", warnMsg);
                        continue;
                    }

                    try
                    {
                        switch (overlay)
                        {
                            case TextFieldOverlay textOverlay:
                                formField.SetValue(textOverlay.Text ?? string.Empty);
                                break;

                            case CheckboxFieldOverlay checkboxOverlay:
                                if (checkboxOverlay.IsChecked)
                                {
                                    var exportValues = formField.GetAppearanceStates();
                                    string checkValue = exportValues?.FirstOrDefault(v => !v.Equals("Off", StringComparison.OrdinalIgnoreCase)) ?? "Yes";
                                    formField.SetValue(checkValue);
                                }
                                else
                                {
                                    formField.SetValue("Off");
                                }
                                break;

                            case ImageFieldOverlay imageOverlay:
                                bool imageSet = TrySetImageField(formField, imageOverlay);
                                if (!imageSet)
                                {
                                    _logger?.LogInformation("Image field '{FieldName}' could not be populated as AcroForm widget. Scheduling delegated overlay fallback.", fieldName);
                                    fallbackImageOverlays.Add(imageOverlay);
                                }
                                break;

                            default:
                                _logger?.LogWarning("Unhandled field overlay type '{OverlayType}' for field '{FieldName}'.", overlay.GetType().Name, fieldName);
                                break;
                        }
                    }
                    catch (Exception ex)
                    {
                        if (options.ThrowOnMissingFields)
                        {
                            throw;
                        }
                        _logger?.LogWarning(ex, "Failed setting value for field '{FieldName}'. Continuing rendering.", fieldName);
                    }
                }
            }

            if (options.Flatten && acroForm != null)
            {
                acroForm.FlattenFields();
            }
        }

        byte[] renderedBytes = outputStream.ToArray();
        var resultStream = new MemoryStream(renderedBytes);

        // Perform delegated image fallback drawing using PDFSharp overlay renderer if any images failed widget replacement
        if (fallbackImageOverlays.Count > 0 && _imageRenderer != null)
        {
            var fallbackOverlayRenderer = new OverlayPdfRenderer();
            return fallbackOverlayRenderer.RenderAsync(resultStream, fallbackImageOverlays, options, cancellationToken);
        }

        return Task.FromResult<Stream>(resultStream);
    }

    private bool TrySetImageField(PdfFormField formField, ImageFieldOverlay imageOverlay)
    {
        if (imageOverlay.ImageBytes == null || imageOverlay.ImageBytes.Length == 0)
            return false;

        try
        {
            var imageData = ImageDataFactory.Create(imageOverlay.ImageBytes);
            formField.SetValue("");
            return false; // Fall back to delegated overlay rendering for custom coordinate image placement
        }
        catch
        {
            return false;
        }
    }
}
