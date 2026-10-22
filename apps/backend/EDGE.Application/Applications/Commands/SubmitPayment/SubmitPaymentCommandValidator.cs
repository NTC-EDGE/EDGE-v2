using System;
using FluentValidation;
using EDGE.Domain.Enums;

namespace EDGE.Application.Applications.Commands.SubmitPayment;

public class SubmitPaymentCommandValidator : AbstractValidator<SubmitPaymentCommand>
{
    public SubmitPaymentCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("Application ID is required.");

        RuleFor(x => x.PaymentMethod)
            .IsInEnum()
            .WithMessage("A valid Payment Method is required.");

        When(x => x.PaymentMethod == PaymentMethod.Online, () =>
        {
            RuleFor(x => x.ReferenceNumber)
                .NotEmpty()
                .WithMessage("Reference/Transaction number is required for online payments.");
        });

        When(x => x.PaymentMethod == PaymentMethod.Check, () =>
        {
            RuleFor(x => x.ReferenceNumber)
                .NotEmpty()
                .WithMessage("Check number is required for check payments.");
        });
    }
}
