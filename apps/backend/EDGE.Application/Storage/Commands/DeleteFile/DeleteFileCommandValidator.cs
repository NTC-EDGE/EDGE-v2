using System;
using FluentValidation;

namespace EDGE.Application.Storage.Commands.DeleteFile;

public class DeleteFileCommandValidator : AbstractValidator<DeleteFileCommand>
{
    public DeleteFileCommandValidator()
    {
        RuleFor(x => x.FileId)
            .NotEmpty().WithMessage("FileId is required.")
            .Must(id => id != Guid.Empty).WithMessage("FileId cannot be an empty GUID.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.")
            .Must(id => id != Guid.Empty).WithMessage("TenantId cannot be an empty GUID.");
    }
}
