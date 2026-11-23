using System;
using FluentValidation;

namespace EDGE.Application.Feedback.Commands.SubmitFeedback;

public class SubmitFeedbackCommandValidator : AbstractValidator<SubmitFeedbackCommand>
{
    public SubmitFeedbackCommandValidator()
    {
        When(x => !x.IsAnonymous, () =>
        {
            RuleFor(x => x.SenderName)
                .NotEmpty().WithMessage("SenderName is required.");

            RuleFor(x => x.SenderEmail)
                .NotEmpty().WithMessage("SenderEmail is required.")
                .EmailAddress().WithMessage("SenderEmail must be a valid email address.");
        });

        RuleFor(x => x.Subject)
            .NotEmpty().WithMessage("Subject is required.")
            .MaximumLength(200).WithMessage("Subject must not exceed 200 characters.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required.")
            .MaximumLength(2000).WithMessage("Message must not exceed 2000 characters.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        When(x => x.TenantId.HasValue, () =>
        {
            RuleFor(x => x.TenantId!.Value)
                .NotEqual(Guid.Empty).WithMessage("Selected Regional Office TenantId must be a valid identifier.");
        });
    }
}

