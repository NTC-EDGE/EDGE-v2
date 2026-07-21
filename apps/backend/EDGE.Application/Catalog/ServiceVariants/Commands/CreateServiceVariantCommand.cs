using MediatR;
using FluentValidation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Catalog.ServiceVariants.DTOs;

namespace EDGE.Application.Catalog.ServiceVariants.Commands;

public record CreateServiceVariantCommand(
    Guid ServiceId,
    ServiceVariantType Type,
    string? Description
) : IRequest<ServiceVariantDto>;

public class CreateServiceVariantCommandValidator : AbstractValidator<CreateServiceVariantCommand>
{
    public CreateServiceVariantCommandValidator()
    {
        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service ID is required.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.")
            .When(x => x.Description is not null);
    }
}

public class CreateServiceVariantCommandHandler : IRequestHandler<CreateServiceVariantCommand, ServiceVariantDto>
{
    private readonly IServiceVariantRepository _variantRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceVariantCommandHandler(
        IServiceVariantRepository variantRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _variantRepository = variantRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceVariantDto> Handle(CreateServiceVariantCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken)
            ?? throw new NotFoundException($"Service with ID '{request.ServiceId}' was not found.");

        var variant = new ServiceVariant
        {
            ServiceId = request.ServiceId,
            Type = request.Type,
            Description = request.Description
        };

        await _variantRepository.AddAsync(variant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceVariantDto(variant.Id, variant.ServiceId, variant.Type, variant.Description, variant.CreatedAt);
    }
}
