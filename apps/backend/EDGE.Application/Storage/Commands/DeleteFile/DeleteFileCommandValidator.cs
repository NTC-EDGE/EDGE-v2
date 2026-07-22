using System;
using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Storage.Commands.DeleteFile;

public class DeleteFileCommandValidator : AbstractValidator<DeleteFileCommand>
{
    public DeleteFileCommandValidator(ITenantRepository tenantRepository)
    {
        RuleFor(x => x.FileId)
            .NotEmpty().WithMessage("FileId is required.")
            .Must(id => id != Guid.Empty).WithMessage("FileId cannot be an empty GUID.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("TenantId is required.")
            .Must(id => id != Guid.Empty).WithMessage("TenantId cannot be an empty GUID.")
            .MustAsync(async (tenantId, ct) => await tenantRepository.GetByIdAsync(tenantId, ct) != null)
            .WithMessage(x => $"Tenant with ID '{x.TenantId}' was not found.");
    }
}
