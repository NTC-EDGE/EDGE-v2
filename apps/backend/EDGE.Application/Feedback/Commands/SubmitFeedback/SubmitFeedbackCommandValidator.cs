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
            .NotEmpty().WithMessage("Subject is required.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
    }
}
