using System;
using System.Linq;
using FluentValidation;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public class CreateSoaCommandValidator : AbstractValidator<CreateSoaCommand>
{
    public CreateSoaCommandValidator()
    {
        RuleFor(x => x.ApplicationId)
            .NotEmpty()
            .WithMessage("ApplicationId is required.");

        RuleFor(x => x.IssuedToName)
            .Must(name => string.IsNullOrEmpty(name) || !string.IsNullOrWhiteSpace(name))
            .WithMessage("IssuedToName cannot be blank whitespace when provided.");

        RuleFor(x => x.ValidityYears)
            .GreaterThan(0)
            .When(x => x.ValidityYears.HasValue)
            .WithMessage("ValidityYears must be greater than zero when provided.");

        RuleFor(x => x.NoOfUnits)
            .GreaterThan(0)
            .When(x => x.NoOfUnits.HasValue)
            .WithMessage("NoOfUnits must be greater than zero when provided.");

        RuleFor(x => x.AdditionalServicesCount)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AdditionalServicesCount.HasValue)
            .WithMessage("AdditionalServicesCount cannot be negative.");

        RuleFor(x => x.NoOfCopies)
            .GreaterThan(0)
            .When(x => x.NoOfCopies.HasValue)
            .WithMessage("NoOfCopies must be greater than zero when provided.");

        RuleFor(x => x.LineItems)
            .Must(items =>
            {
                if (items == null || items.Count <= 1) return true;
                var particulars = items.Select(i =>
                {
                    var p = (i.Particular ?? string.Empty).Trim().ToLowerInvariant();
                    return p.StartsWith("others") ? "others" : p;
                })
                .Where(p => !string.IsNullOrEmpty(p))
                .ToList();
                return particulars.Distinct().Count() == particulars.Count;
            })
            .WithMessage("Particular already exist.")
            .When(x => x.LineItems != null && x.LineItems.Count > 1);

        RuleForEach(x => x.LineItems)
            .SetValidator(new CreateSoaLineItemRequestValidator())
            .When(x => x.LineItems != null && x.LineItems.Count > 0);
    }
}

public class CreateSoaLineItemRequestValidator : AbstractValidator<CreateSoaLineItemRequest>
{
    public CreateSoaLineItemRequestValidator()
    {
        RuleFor(x => x.Particular)
            .NotEmpty()
            .WithMessage("Line item particular is required.");

        RuleFor(x => x.NoOfUnits)
            .GreaterThan(0)
            .WithMessage("Line item NoOfUnits must be greater than zero.");

        RuleFor(x => x.FeeRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Line item FeeRate cannot be negative.");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Line item Amount cannot be negative.");

        RuleFor(x => x.ValidityYears)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Line item ValidityYears cannot be negative.");
    }
}
