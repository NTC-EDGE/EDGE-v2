using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO;

namespace EDGE.Infrastructure.Printing.Services.Rendering;

public class OverlayPdfRenderer : IPdfRenderer
{
    private readonly PdfFieldRenderer _fieldRenderer;

    public RenderingStrategy Strategy => RenderingStrategy.Overlay;
    public string Name => "PDFSharp Overlay";

    public OverlayPdfRenderer(PdfFieldRenderer? fieldRenderer = null)
    {
        _fieldRenderer = fieldRenderer ?? new PdfFieldRenderer();
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
        var debugOptions = options.DebugOptions ?? new OverlayDebugOptions { Enabled = false };

        // Ensure template stream is read from position 0 if seekable
        if (template.CanSeek)
        {
            template.Position = 0;
        }

        using var document = PdfReader.Open(template, PdfDocumentOpenMode.Modify);

        for (int i = 0; i < document.Pages.Count; i++)
        {
            var page = document.Pages[i];
            using var gfx = XGraphics.FromPdfPage(page);
            var context = new PdfRenderingContext(gfx, debugOptions);

            if (debugOptions.Enabled)
            {
                PdfOverlayDebugRenderer.RenderGrid(gfx, page.Width.Point, page.Height.Point, debugOptions);
            }

            if (overlays != null && overlays.Count > 0)
            {
                _fieldRenderer.RenderOverlays(context, overlays.ToList());
            }
        }

        var outputStream = new MemoryStream();
        document.Save(outputStream, false);
        outputStream.Position = 0;

        return Task.FromResult<Stream>(outputStream);
    }
}
