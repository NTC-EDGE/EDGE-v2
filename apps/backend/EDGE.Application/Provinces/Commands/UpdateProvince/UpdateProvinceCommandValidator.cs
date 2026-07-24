using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Provinces.Commands.UpdateProvince;

public class UpdateProvinceCommandValidator : AbstractValidator<UpdateProvinceCommand>
{
    private readonly IGeographicRepository _repository;

    public UpdateProvinceCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.RegionId)
            .NotEmpty().WithMessage("Region ID is required.")
            .MustAsync(async (regionId, token) =>
            {
                var region = await _repository.GetRegionByIdAsync(regionId, token);
                return region != null;
            }).WithMessage("The associated Region does not exist.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Province Code is required.")
            .MaximumLength(20).WithMessage("Province Code must not exceed 20 characters.")
            .MustAsync(async (model, code, token) => await _repository.IsProvinceCodeUniqueAsync(code, model.Id, token))
            .WithMessage("Province Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Province Name is required.")
            .MaximumLength(100).WithMessage("Province Name must not exceed 100 characters.");
    }
}
