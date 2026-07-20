using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Municipalities.Commands.CreateMunicipality;

public class CreateMunicipalityCommandValidator : AbstractValidator<CreateMunicipalityCommand>
{
    private readonly IGeographicRepository _repository;

    public CreateMunicipalityCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.ProvinceId)
            .NotEmpty().WithMessage("Province ID is required.")
            .MustAsync(async (provinceId, token) => {
                var province = await _repository.GetProvinceByIdAsync(provinceId, token);
                return province != null;
            }).WithMessage("The associated Province does not exist.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Municipality Code is required.")
            .MaximumLength(20).WithMessage("Municipality Code must not exceed 20 characters.")
            .MustAsync(async (code, token) => await _repository.IsMunicipalityCodeUniqueAsync(code, null, token))
            .WithMessage("Municipality Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Municipality Name is required.")
            .MaximumLength(100).WithMessage("Municipality Name must not exceed 100 characters.");
    }
}
