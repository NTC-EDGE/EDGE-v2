using MediatR;
using FluentValidation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Catalog.ServiceCategories.DTOs;

namespace EDGE.Application.Catalog.ServiceCategories.Commands;

public record UpdateServiceCategoryCommand(
    Guid Id,
    ServiceCategoryType Type,
    string Name,
    string? Code
) : IRequest<ServiceCategoryDto>;

public class UpdateServiceCategoryCommandValidator : AbstractValidator<UpdateServiceCategoryCommand>
{
    public UpdateServiceCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service category ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service category name is required.")
            .MaximumLength(200).WithMessage("Service category name must not exceed 200 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Service category code must not exceed 50 characters.")
            .When(x => x.Code is not null);
    }
}

public class UpdateServiceCategoryCommandHandler : IRequestHandler<UpdateServiceCategoryCommand, ServiceCategoryDto>
{
    private readonly IServiceCategoryRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceCategoryCommandHandler(
        IServiceCategoryRepository repository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceCategoryDto> Handle(UpdateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"ServiceCategory with ID '{request.Id}' was not found.");

        category.Type = request.Type;
        category.Name = request.Name;
        category.Code = request.Code;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceCategoryDto(category.Id, category.Type, category.Name, category.Code, category.CreatedAt);
    }
}
