using FluentValidation;

namespace EDGE.Application.Applicants.Commands.UpdateApplicantDetail;

public class UpdateApplicantDetailCommandValidator : AbstractValidator<UpdateApplicantDetailCommand>
{
    public UpdateApplicantDetailCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Applicant ID is required.");

        RuleFor(x => x.FirstName)
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.ContactNumber)
            .MaximumLength(20).WithMessage("Contact number must not exceed 20 characters.");

        RuleFor(x => x.CompanyName)
            .MaximumLength(150).WithMessage("Company name must not exceed 150 characters.");

        RuleFor(x => x.CompanyRegistrationNumber)
            .MaximumLength(50).WithMessage("Company registration number must not exceed 50 characters.");

        RuleFor(x => x.CompanyContactNumber)
            .MaximumLength(20).WithMessage("Company contact number must not exceed 20 characters.");
    }
}
