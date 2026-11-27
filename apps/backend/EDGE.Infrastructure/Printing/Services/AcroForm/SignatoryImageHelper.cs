using System;
using System.IO;
using iText.Forms;
using iText.Forms.Fields;
using iText.IO.Image;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;

namespace EDGE.Infrastructure.Printing.Services.AcroForm;

/// <summary>
/// Shared utilities for decoding staff e-signatures, removing grey AcroForm
/// button/field backgrounds on signatory areas, and cleanly stamping optional
/// e-signature images above signatory names.
/// </summary>
public static class SignatoryImageHelper
{
    /// <summary>
    /// Decodes an inline signature image stored as a data URI (data:image/png;base64,...)
    /// or raw base64 PNG/JPEG string. Returns null for empty values, plain text names,
    /// GUID file IDs, or non-image payloads.
    /// </summary>
    public static byte[]? TryDecodeInlineSignatureBytes(string? rawSignature)
    {
        if (string.IsNullOrWhiteSpace(rawSignature)) return null;

        var trimmed = rawSignature.Trim();

        // Ignore StoredFileId GUIDs or URLs here (those are resolved asynchronously by endpoints)
        if (Guid.TryParse(trimmed, out _)) return null;
        if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        string base64Part = trimmed;
        if (trimmed.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            var commaIdx = trimmed.IndexOf(',');
            if (commaIdx < 0 || commaIdx >= trimmed.Length - 1) return null;

            var header = trimmed[..commaIdx];
            if (!header.Contains("base64", StringComparison.OrdinalIgnoreCase)) return null;
            if (!header.Contains("image/png", StringComparison.OrdinalIgnoreCase) &&
                !header.Contains("image/jpeg", StringComparison.OrdinalIgnoreCase) &&
                !header.Contains("image/jpg", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            base64Part = trimmed[(commaIdx + 1)..].Trim();
        }
        else if (trimmed.Length < 40 || trimmed.Contains(' '))
        {
            // Plain text signatory name or short non-image string
            return null;
        }

        try
        {
            var bytes = Convert.FromBase64String(base64Part);
            return IsSupportedRasterImage(bytes) ? bytes : null;
        }
        catch
        {
            return null;
        }
    }

    public static bool IsSupportedRasterImage(byte[]? bytes)
    {
        if (bytes == null || bytes.Length < 8) return false;

        // PNG magic: 89 50 4E 47 0D 0A 1A 0A
        bool isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        // JPEG magic: FF D8 FF
        bool isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;

        return isPng || isJpeg;
    }

    /// <summary>
    /// Extracts the primary widget bounding box for a signature placeholder field and removes
    /// the field from the AcroForm so flattening does not paint a solid grey button rectangle.
    /// </summary>
    public static Rectangle? ExtractRectAndRemovePlaceholder(PdfAcroForm form, string fieldName)
    {
        Rectangle? rect = null;
        try
        {
            var field = form.GetField(fieldName);
            if (field != null)
            {
                var widgets = field.GetWidgets();
                if (widgets != null && widgets.Count > 0)
                {
                    rect = widgets[0].GetRectangle()?.ToRectangle();
                }
                form.RemoveField(fieldName);
            }
        }
        catch
        {
            // Ignore removal failures so PDF generation continues
        }

        return rect;
    }

    /// <summary>
    /// Clears any background fill (/MK /BG) or border color (/MK /BC) from an AcroForm
    /// signatory text field so flattening renders clean black text on a transparent background.
    /// </summary>
    public static void ClearFieldBackground(PdfAcroForm form, string fieldName)
    {
        try
        {
            var field = form.GetField(fieldName);
            if (field == null) return;

            var widgets = field.GetWidgets();
            if (widgets == null) return;

            foreach (var widget in widgets)
            {
                var widgetDict = widget.GetPdfObject();
                var mk = widgetDict.GetAsDictionary(PdfName.MK);
                if (mk != null)
                {
                    mk.Remove(PdfName.BG);
                    mk.Remove(PdfName.BC);
                }
                widgetDict.Remove(PdfName.BS);
            }
        }
        catch
        {
            // Ignore field styling errors
        }
    }

    /// <summary>
    /// Stamps a signature image cleanly centered inside targetRect while preserving its
    /// aspect ratio. Never throws if the image is invalid.
    /// </summary>
    public static void StampSignatureCentered(
        PdfDocument pdfDoc,
        PdfPage page,
        Rectangle? targetRect,
        byte[]? signatureBytes)
    {
        if (targetRect == null || !IsSupportedRasterImage(signatureBytes)) return;
        if (targetRect.GetWidth() <= 4f || targetRect.GetHeight() <= 4f) return;

        try
        {
            var imageData = ImageDataFactory.Create(signatureBytes);
            float imgW = imageData.GetWidth();
            float imgH = imageData.GetHeight();
            if (imgW <= 0 || imgH <= 0) return;

            // Add small inner padding so the signature breathes cleanly above the printed name
            float padX = Math.Min(4f, targetRect.GetWidth() * 0.05f);
            float padY = Math.Min(1.5f, targetRect.GetHeight() * 0.08f);
            float availW = Math.Max(4f, targetRect.GetWidth() - (padX * 2f));
            float availH = Math.Max(4f, targetRect.GetHeight() - (padY * 2f));

            float scale = Math.Min(availW / imgW, availH / imgH);
            float drawW = imgW * scale;
            float drawH = imgH * scale;

            float drawX = targetRect.GetX() + (targetRect.GetWidth() - drawW) / 2f;
            float drawY = targetRect.GetY() + padY + (availH - drawH) / 2f;

            var fittedRect = new Rectangle(drawX, drawY, drawW, drawH);
            var canvas = new PdfCanvas(page.NewContentStreamAfter(), page.GetResources(), pdfDoc);
            canvas.SaveState();
            canvas.AddImageFittedIntoRectangle(imageData, fittedRect, false);
            canvas.RestoreState();
        }
        catch
        {
            // Gracefully ignore corrupt or unreadable signature images
        }
    }
}
