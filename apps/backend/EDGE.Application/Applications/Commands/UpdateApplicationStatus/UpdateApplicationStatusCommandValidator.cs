using System;
using FluentValidation;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.UpdateApplicationStatus;

public class UpdateApplicationStatusCommandValidator : AbstractValidator<UpdateApplicationStatusCommand>
{
    public UpdateApplicationStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Application ID is required.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(status => Enum.TryParse<ApplicationStatus>(status, true, out _))
            .WithMessage($"Status must be one of: {string.Join(", ", Enum.GetNames<ApplicationStatus>())}.");

        RuleFor(x => x.Remarks)
            .NotEmpty()
            .When(x => string.Equals(x.Status, nameof(ApplicationStatus.Returned), StringComparison.OrdinalIgnoreCase) ||
                       (!string.IsNullOrWhiteSpace(x.Action) && x.Action.StartsWith("Returned", StringComparison.OrdinalIgnoreCase)))
            .WithMessage("A return reason or remarks must be provided when returning an application.");

        RuleFor(x => x.Remarks)
            .MaximumLength(2000)
            .WithMessage("Remarks cannot exceed 2000 characters.");
    }
}
