using System;
using System.IO;
using System.Linq;
using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Applications.Commands.UploadApplicantRequirement;

public class UploadApplicantRequirementCommandValidator : AbstractValidator<UploadApplicantRequirementCommand>
{
    private static readonly string[] AllowedExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff" };
    private static readonly string[] AllowedMimeTypes = {
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/pjpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/bmp",
        "image/tiff"
    };

    public UploadApplicantRequirementCommandValidator(IStoredFileRepository storedFileRepository)
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty().WithMessage("ApplicationId is required.");

        RuleFor(x => x.ApplicantId)
            .NotEmpty().WithMessage("ApplicantId is required.");

        RuleFor(x => x.StoredFileId)
            .NotEmpty().WithMessage("StoredFileId is required.")
            .MustAsync(async (fileId, ct) =>
            {
                var storedFile = await storedFileRepository.GetByIdAsync(fileId, ct);
                if (storedFile == null) return false;

                var ext = (Path.GetExtension(storedFile.FileName) ?? string.Empty).ToLowerInvariant();
                var contentType = (storedFile.ContentType ?? string.Empty).ToLowerInvariant();

                var isAllowedExt = AllowedExtensions.Contains(ext);
                var isAllowedMime = AllowedMimeTypes.Contains(contentType) || (contentType.StartsWith("image/") && !contentType.Contains("javascript") && !contentType.Contains("html"));

                return isAllowedExt && isAllowedMime;
            })
            .WithMessage("Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are accepted.");

        RuleFor(x => x)
            .Must(x => x.RequirementId.HasValue || x.ServiceVariantRequirementId.HasValue)
            .WithMessage("Either RequirementId or ServiceVariantRequirementId must be provided.");
    }

    /// <summary>
    /// Validates raw binary header bytes (magic bytes) to ensure file format authenticity against MIME spoofing.
    /// </summary>
    public static bool IsValidMagicHeader(byte[] headerBytes)
    {
        if (headerBytes == null || headerBytes.Length < 4) return false;

        // PDF: %PDF (% = 0x25, P = 0x50, D = 0x44, F = 0x46)
        if (headerBytes[0] == 0x25 && headerBytes[1] == 0x50 && headerBytes[2] == 0x44 && headerBytes[3] == 0x46)
            return true;

        // JPEG: 0xFF, 0xD8, 0xFF
        if (headerBytes[0] == 0xFF && headerBytes[1] == 0xD8 && headerBytes[2] == 0xFF)
            return true;

        // PNG: 0x89, 0x50, 0x4E, 0x47
        if (headerBytes[0] == 0x89 && headerBytes[1] == 0x50 && headerBytes[2] == 0x4E && headerBytes[3] == 0x47)
            return true;

        // GIF: GIF8 (0x47, 0x49, 0x46, 0x38)
        if (headerBytes[0] == 0x47 && headerBytes[1] == 0x49 && headerBytes[2] == 0x46 && headerBytes[3] == 0x38)
            return true;

        // BMP: BM (0x42, 0x4D)
        if (headerBytes[0] == 0x42 && headerBytes[1] == 0x4D)
            return true;

        // WEBP: RIFF (0x52, 0x49, 0x46, 0x46)
        if (headerBytes[0] == 0x52 && headerBytes[1] == 0x49 && headerBytes[2] == 0x46 && headerBytes[3] == 0x46)
            return true;

        // TIFF: II (0x49, 0x49) or MM (0x4D, 0x4D)
        if ((headerBytes[0] == 0x49 && headerBytes[1] == 0x49) || (headerBytes[0] == 0x4D && headerBytes[1] == 0x4D))
            return true;

        return false;
    }
}
