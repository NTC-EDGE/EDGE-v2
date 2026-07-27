using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Municipalities.Commands.UpdateMunicipality;

public class UpdateMunicipalityCommandValidator : AbstractValidator<UpdateMunicipalityCommand>
{
    private readonly IGeographicRepository _repository;

    public UpdateMunicipalityCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.ProvinceId)
            .NotEmpty().WithMessage("Province ID is required.")
            .MustAsync(async (provinceId, token) =>
            {
                var province = await _repository.GetProvinceByIdAsync(provinceId, token);
                return province != null;
            }).WithMessage("The associated Province does not exist.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Municipality Code is required.")
            .MaximumLength(20).WithMessage("Municipality Code must not exceed 20 characters.")
            .MustAsync(async (model, code, token) => await _repository.IsMunicipalityCodeUniqueAsync(code, model.Id, token))
            .WithMessage("Municipality Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Municipality Name is required.")
            .MaximumLength(100).WithMessage("Municipality Name must not exceed 100 characters.");
    }
}
