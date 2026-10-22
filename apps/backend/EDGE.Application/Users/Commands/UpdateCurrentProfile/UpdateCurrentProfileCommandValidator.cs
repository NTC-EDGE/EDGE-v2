using System;
using FluentValidation;

namespace EDGE.Application.Users.Commands.UpdateCurrentProfile;

public class UpdateCurrentProfileCommandValidator : AbstractValidator<UpdateCurrentProfileCommand>
{
    public UpdateCurrentProfileCommandValidator()
    {
        When(x => !string.IsNullOrEmpty(x.FirstName), () =>
        {
            RuleFor(x => x.FirstName)
                .MaximumLength(100)
                .WithMessage("First name must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.LastName), () =>
        {
            RuleFor(x => x.LastName)
                .MaximumLength(100)
                .WithMessage("Last name must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.MiddleName), () =>
        {
            RuleFor(x => x.MiddleName)
                .MaximumLength(100)
                .WithMessage("Middle name must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.Suffix), () =>
        {
            RuleFor(x => x.Suffix)
                .MaximumLength(20)
                .WithMessage("Suffix must not exceed 20 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.ContactNumber), () =>
        {
            RuleFor(x => x.ContactNumber)
                .MaximumLength(30)
                .WithMessage("Contact number must not exceed 30 characters.");
        });

        When(x => x.DateOfBirth.HasValue, () =>
        {
            RuleFor(x => x.DateOfBirth!.Value)
                .LessThan(DateTime.UtcNow)
                .WithMessage("Date of birth must be in the past.");
        });

        When(x => !string.IsNullOrEmpty(x.Sex), () =>
        {
            RuleFor(x => x.Sex)
                .Must(s => s == "Male" || s == "Female" || s == "Other")
                .WithMessage("Sex must be 'Male', 'Female', or 'Other'.");
        });

        When(x => !string.IsNullOrEmpty(x.Nationality), () =>
        {
            RuleFor(x => x.Nationality)
                .MaximumLength(100)
                .WithMessage("Nationality must not exceed 100 characters.");
        });

        When(x => !string.IsNullOrEmpty(x.ZipCode), () =>
        {
            RuleFor(x => x.ZipCode)
                .MaximumLength(10)
                .WithMessage("Zip code must not exceed 10 characters.");
        });
    }
}
