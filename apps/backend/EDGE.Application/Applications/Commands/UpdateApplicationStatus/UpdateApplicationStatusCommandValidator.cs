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
            .WithMessage("Status must be a valid value: Draft, Submitted, UnderReview, Approved, or Rejected.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500)
            .WithMessage("Remarks cannot exceed 500 characters.");
    }
}
