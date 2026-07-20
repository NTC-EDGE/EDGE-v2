using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Regions.Commands.UpdateRegion;

public class UpdateRegionCommandValidator : AbstractValidator<UpdateRegionCommand>
{
    private readonly IGeographicRepository _repository;

    public UpdateRegionCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Region Code is required.")
            .MaximumLength(20).WithMessage("Region Code must not exceed 20 characters.")
            .MustAsync(async (model, code, token) => await _repository.IsRegionCodeUniqueAsync(code, model.Id, token))
            .WithMessage("Region Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Region Name is required.")
            .MaximumLength(100).WithMessage("Region Name must not exceed 100 characters.");
    }
}
