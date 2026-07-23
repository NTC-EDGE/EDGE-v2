using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Barangays.Commands.UpdateBarangay;

public class UpdateBarangayCommandValidator : AbstractValidator<UpdateBarangayCommand>
{
    private readonly IGeographicRepository _repository;

    public UpdateBarangayCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.MunicipalityId)
            .NotEmpty().WithMessage("Municipality ID is required.")
            .MustAsync(async (municipalityId, token) =>
            {
                var municipality = await _repository.GetMunicipalityByIdAsync(municipalityId, token);
                return municipality != null;
            }).WithMessage("The associated Municipality does not exist.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Barangay Code is required.")
            .MaximumLength(20).WithMessage("Barangay Code must not exceed 20 characters.")
            .MustAsync(async (model, code, token) => await _repository.IsBarangayCodeUniqueAsync(code, model.Id, token))
            .WithMessage("Barangay Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Barangay Name is required.")
            .MaximumLength(100).WithMessage("Barangay Name must not exceed 100 characters.");
    }
}
