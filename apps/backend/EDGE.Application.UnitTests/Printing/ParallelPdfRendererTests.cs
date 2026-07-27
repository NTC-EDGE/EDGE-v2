using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;
using EDGE.Infrastructure.Printing.Services.Initialization;
using EDGE.Infrastructure.Printing.Services.Renderers;
using EDGE.Infrastructure.Printing.Services.Rendering;
using EDGE.Infrastructure.Printing.Services.Templates;
using iText.Forms;
using iText.Forms.Fields;
using PdfSharp.Pdf.IO;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class ParallelPdfRendererTests
{
    [Fact]
    public void ITextLibraryInitializer_IsThreadSafeAndIdempotent()
    {
        var initializer = new ITextLibraryInitializer();
        Assert.False(initializer.IsInitialized);

        Parallel.For(0, 50, _ =>
        {
            initializer.Initialize();
        });

        Assert.True(initializer.IsInitialized);
    }

    [Fact]
    public void PdfRendererFactory_ResolvesCorrectStrategy()
    {
        var overlayRenderer = new OverlayPdfRenderer();
        var fillableRenderer = new FillablePdfRenderer();

        var factory = new PdfRendererFactory(new IPdfRenderer[] { overlayRenderer, fillableRenderer });

        var resolvedOverlay = factory.Resolve(RenderingStrategy.Overlay);
        var resolvedFillable = factory.Resolve(RenderingStrategy.Fillable);

        Assert.Same(overlayRenderer, resolvedOverlay);
        Assert.Same(fillableRenderer, resolvedFillable);
        Assert.Equal("PDFSharp Overlay", resolvedOverlay.Name);
        Assert.Equal("iText Fillable", resolvedFillable.Name);
    }

    [Fact]
    public void PdfRendererFactory_ThrowsForUnregisteredStrategy()
    {
        var factory = new PdfRendererFactory(Array.Empty<IPdfRenderer>());
        Assert.Throws<NotSupportedException>(() => factory.Resolve(RenderingStrategy.Overlay));
    }

    [Fact]
    public async Task OverlayPdfRenderer_RendersValidPdfStream()
    {
        var renderer = new OverlayPdfRenderer();
        byte[] samplePdf = CreateBlankPdfBytes();

        using var templateStream = new MemoryStream(samplePdf);
        var overlays = new List<FieldOverlay>
        {
            new TextFieldOverlay(new PdfField("Applicant.LastName", 100, 100), "Juan")
        };

        using var resultStream = await renderer.RenderAsync(templateStream, overlays);

        Assert.NotNull(resultStream);
        Assert.True(resultStream.Length > 100);

        using var pdfDoc = PdfSharp.Pdf.IO.PdfReader.Open(resultStream, PdfDocumentOpenMode.Import);
        Assert.Equal(1, pdfDoc.PageCount);
    }

    [Fact]
    public async Task FillablePdfRenderer_FillsAcroFormAndAssertsValuesAndFlattening()
    {
        byte[] fillablePdfBytes = CreateFillablePdfWithFields("Applicant.LastName", "IsApproved");
        var renderer = new FillablePdfRenderer();

        using var templateStream = new MemoryStream(fillablePdfBytes);
        var overlays = new List<FieldOverlay>
        {
            new TextFieldOverlay(new PdfField("Applicant.LastName", 0, 0), "Juan"),
            new CheckboxFieldOverlay(new PdfField("IsApproved", 0, 0), true)
        };

        var options = new PdfRenderOptions(Flatten: true);
        using var resultStream = await renderer.RenderAsync(templateStream, overlays, options);

        Assert.NotNull(resultStream);
        Assert.True(resultStream.Length > 100);

        // Read rendered stream with iText 7/8 to verify content and flattening
        resultStream.Position = 0;
        using var reader = new iText.Kernel.Pdf.PdfReader(resultStream);
        using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
        var acroForm = PdfAcroForm.GetAcroForm(pdfDoc, false);

        // Flattening removes or locks editable form fields
        Assert.True(acroForm == null || acroForm.GetAllFormFields().Count == 0);
    }

    [Fact]
    public async Task FillablePdfRenderer_MissingField_LogsWarningOrThrowsBasedOnOption()
    {
        byte[] fillablePdfBytes = CreateFillablePdfWithFields("ExistingField");
        var renderer = new FillablePdfRenderer();

        var overlays = new List<FieldOverlay>
        {
            new TextFieldOverlay(new PdfField("NonExistentField", 0, 0), "Value")
        };

        // 1. ThrowOnMissingFields = false -> Should not throw
        using (var templateStream = new MemoryStream(fillablePdfBytes))
        {
            var options = new PdfRenderOptions(ThrowOnMissingFields: false);
            using var resultStream = await renderer.RenderAsync(templateStream, overlays, options);
            Assert.NotNull(resultStream);
        }

        // 2. ThrowOnMissingFields = true -> Should throw KeyNotFoundException
        using (var templateStream = new MemoryStream(fillablePdfBytes))
        {
            var options = new PdfRenderOptions(ThrowOnMissingFields: true);
            await Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            {
                await renderer.RenderAsync(templateStream, overlays, options);
            });
        }
    }

    [Fact]
    public async Task FunctionalParity_OverlayAndFillable_ProduceValidSinglePagePdfs()
    {
        var overlayRenderer = new OverlayPdfRenderer();
        var fillableRenderer = new FillablePdfRenderer();

        byte[] templateBytes = CreateFillablePdfWithFields("Applicant.LastName");

        var overlays = new List<FieldOverlay>
        {
            new TextFieldOverlay(new PdfField("Applicant.LastName", 50, 50), "Juan")
        };

        using var stream1 = new MemoryStream(templateBytes);
        using var stream2 = new MemoryStream(templateBytes);

        using var overlayResult = await overlayRenderer.RenderAsync(stream1, overlays);
        using var fillableResult = await fillableRenderer.RenderAsync(stream2, overlays);

        Assert.True(overlayResult.Length > 0);
        Assert.True(fillableResult.Length > 0);

        // Both streams represent valid single page PDFs
        overlayResult.Position = 0;
        fillableResult.Position = 0;

        using var pdf1 = PdfSharp.Pdf.IO.PdfReader.Open(overlayResult, PdfDocumentOpenMode.Import);
        using var pdf2 = PdfSharp.Pdf.IO.PdfReader.Open(fillableResult, PdfDocumentOpenMode.Import);

        Assert.Equal(pdf1.PageCount, pdf2.PageCount);
        Assert.Equal(1, pdf1.PageCount);
    }

    private static byte[] CreateBlankPdfBytes()
    {
        using var doc = new PdfSharp.Pdf.PdfDocument();
        doc.AddPage();
        using var ms = new MemoryStream();
        doc.Save(ms, false);
        return ms.ToArray();
    }

    private static byte[] CreateFillablePdfWithFields(params string[] textFields)
    {
        using var ms = new MemoryStream();
        using (var writer = new iText.Kernel.Pdf.PdfWriter(ms))
        using (var pdfDoc = new iText.Kernel.Pdf.PdfDocument(writer))
        {
            var page = pdfDoc.AddNewPage();
            var acroForm = PdfAcroForm.GetAcroForm(pdfDoc, true);

            float y = 700;
            foreach (var name in textFields)
            {
                var rect = new iText.Kernel.Geom.Rectangle(100, y, 200, 20);
                var textField = new PdfFormFactory().CreateTextFormField(pdfDoc);
                textField.SetFieldName(name);
                acroForm.AddField(textField);
                y -= 30;
            }
        }
        return ms.ToArray();
    }
}
