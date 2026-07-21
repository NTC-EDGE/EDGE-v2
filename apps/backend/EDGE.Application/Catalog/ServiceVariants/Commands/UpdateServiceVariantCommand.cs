using MediatR;
using FluentValidation;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Catalog.ServiceVariants.DTOs;

namespace EDGE.Application.Catalog.ServiceVariants.Commands;

public record UpdateServiceVariantCommand(
    Guid Id,
    Guid ServiceId,
    ServiceVariantType Type,
    string? Description
) : IRequest<ServiceVariantDto>;

public class UpdateServiceVariantCommandValidator : AbstractValidator<UpdateServiceVariantCommand>
{
    public UpdateServiceVariantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Variant ID is required.");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
            .When(x => x.Description is not null);
    }
}

public class UpdateServiceVariantCommandHandler : IRequestHandler<UpdateServiceVariantCommand, ServiceVariantDto>
{
    private readonly IServiceVariantRepository _variantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceVariantCommandHandler(
        IServiceVariantRepository variantRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantDto> Handle(UpdateServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var variant = await _variantRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"ServiceVariant with ID '{request.Id}' was not found.");

        if (variant.ServiceId != request.ServiceId)
        {
            throw new InvalidOperationException("Variant does not belong to the specified service.");
        }

        variant.Type = request.Type;
        variant.Description = request.Description;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantDto(variant.Id, variant.ServiceId, variant.Type, variant.Description, variant.CreatedAt);
    }
}
