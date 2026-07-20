using FluentValidation;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Regions.Commands.CreateRegion;

public class CreateRegionCommandValidator : AbstractValidator<CreateRegionCommand>
{
    private readonly IGeographicRepository _repository;

    public CreateRegionCommandValidator(IGeographicRepository repository)
    {
        _repository = repository;

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Region Code is required.")
            .MaximumLength(20).WithMessage("Region Code must not exceed 20 characters.")
            .MustAsync(async (code, token) => await _repository.IsRegionCodeUniqueAsync(code, null, token))
            .WithMessage("Region Code must be unique.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Region Name is required.")
            .MaximumLength(100).WithMessage("Region Name must not exceed 100 characters.");
    }
}
