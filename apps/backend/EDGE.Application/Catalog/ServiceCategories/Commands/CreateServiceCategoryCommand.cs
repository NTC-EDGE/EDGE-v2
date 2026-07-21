using MediatR;
using FluentValidation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Catalog.ServiceCategories.DTOs;

namespace EDGE.Application.Catalog.ServiceCategories.Commands;

public record CreateServiceCategoryCommand(
    ServiceCategoryType Type,
    string Name,
    string? Code
) : IRequest<ServiceCategoryDto>;

public class CreateServiceCategoryCommandValidator : AbstractValidator<CreateServiceCategoryCommand>
{
    public CreateServiceCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service category name is required.")
            .MaximumLength(200).WithMessage("Service category name must not exceed 200 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Service category code must not exceed 50 characters.")
            .When(x => x.Code is not null);
    }
}

public class CreateServiceCategoryCommandHandler : IRequestHandler<CreateServiceCategoryCommand, ServiceCategoryDto>
{
    private readonly IServiceCategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceCategoryCommandHandler(
        IServiceCategoryRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceCategoryDto> Handle(CreateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new ServiceCategory
        {
            Type = request.Type,
            Name = request.Name,
            Code = request.Code
        };

        await _repository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceCategoryDto(category.Id, category.Type, category.Name, category.Code, category.CreatedAt);
    }
}
