using System;
using FluentValidation;

namespace EDGE.Application.Storage.Commands.UploadFile;

public class UploadFileCommandValidator : AbstractValidator<UploadFileCommand>
{
    public UploadFileCommandValidator()
    {
        RuleFor(x => x.FileStream)
            .NotNull().WithMessage("FileStream is required.")
            .Must(stream => stream != null && stream.CanRead && stream.Length > 0)
            .WithMessage("A valid, non-empty file stream is required.");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("FileName is required.")
            .MaximumLength(255).WithMessage("FileName cannot exceed 255 characters.");

        RuleFor(x => x.ContentType)
            .NotEmpty().WithMessage("ContentType is required.")
            .MaximumLength(100).WithMessage("ContentType cannot exceed 100 characters.");

        RuleFor(x => x.FileSizeBytes)
            .GreaterThan(0).WithMessage("FileSizeBytes must be greater than 0 bytes.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.")
            .Must(id => id != Guid.Empty).WithMessage("TenantId cannot be empty.");

        RuleFor(x => x.UploadedByUserId)
            .NotEmpty().WithMessage("UploadedByUserId is required (anonymous uploads are strictly forbidden).");
    }
}
