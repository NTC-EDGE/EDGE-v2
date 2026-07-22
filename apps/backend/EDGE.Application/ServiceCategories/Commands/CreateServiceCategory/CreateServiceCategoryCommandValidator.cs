using FluentValidation;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;
using System;

namespace EDGE.Application.ServiceCategories.Commands.CreateServiceCategory;

public class CreateServiceCategoryCommandValidator : AbstractValidator<CreateServiceCategoryCommand>
{
    public CreateServiceCategoryCommandValidator(IServiceCategoryRepository repository)
    {
        RuleFor(v => v.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(v => v.Code)
            .MaximumLength(20)
            .MustAsync(async (code, cancellationToken) => 
            {
                return await repository.IsCodeUniqueAsync(code, null, cancellationToken);
            })
            .When(v => !string.IsNullOrWhiteSpace(v.Code))
            .WithMessage("Code must be unique.");
            
        RuleFor(v => v.Type)
            .NotEmpty()
            .Must(t => Enum.TryParse<ServiceCategoryType>(t, true, out _))
            .WithMessage("Type must be one of: Certificate, Accreditation, Exam, License, Permit, RequestsAndComplaints.");
    }
}
