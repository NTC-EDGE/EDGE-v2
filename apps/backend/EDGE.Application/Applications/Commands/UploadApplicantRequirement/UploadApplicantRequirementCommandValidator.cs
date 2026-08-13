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
                var isAllowedMime = AllowedMimeTypes.Contains(contentType) || contentType.StartsWith("image/");

                return isAllowedExt || isAllowedMime;
            })
            .WithMessage("Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are accepted.");

        RuleFor(x => x)
            .Must(x => x.RequirementId.HasValue || x.ServiceVariantRequirementId.HasValue)
            .WithMessage("Either RequirementId or ServiceVariantRequirementId must be provided.");
    }
}
