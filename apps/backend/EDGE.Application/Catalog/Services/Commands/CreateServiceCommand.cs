using System.Text.Json;
using MediatR;
using FluentValidation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Catalog.Services.DTOs;

namespace EDGE.Application.Catalog.Services.Commands;

public record CreateServiceCommand(
    Guid ServiceCategoryId,
    Guid TenantId,
    string Name,
    string? Group,
    string? Code,
    string? Description,
    ContractDto Contract
) : IRequest<ServiceDto>;

public class CreateServiceCommandValidator : AbstractValidator<CreateServiceCommand>
{
    private readonly IServiceCategoryRepository _categoryRepository;

    public CreateServiceCommandValidator(IServiceCategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;

        RuleFor(x => x.ServiceCategoryId)
            .NotEmpty().WithMessage("Service category ID is required.");

        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Service name is required.")
            .MaximumLength(300).WithMessage("Service name must not exceed 300 characters.");

        RuleFor(x => x.Code)
            .MaximumLength(50).WithMessage("Service code must not exceed 50 characters.")
            .When(x => x.Code is not null);

        RuleFor(x => x.Contract)
            .NotNull().WithMessage("Contract is required.");

        RuleFor(x => x.Contract.FormNo)
            .NotEmpty().WithMessage("Contract formNo is required.")
            .When(x => x.Contract is not null);

        // Conditional: examineeTypes required for Exams category
        RuleFor(x => x.Contract.ExamineeTypes)
            .NotNull().WithMessage("Contract examineeTypes is required for Exams category.")
            .Must(types => types is not null && types.Count > 0)
            .WithMessage("Contract examineeTypes must contain at least one entry for Exams category.")
            .WhenAsync(async (cmd, ct) =>
            {
                if (cmd.ServiceCategoryId == Guid.Empty)
                {
                    return false;
                }
                var category = await _categoryRepository.GetByIdAsync(cmd.ServiceCategoryId, ct);
                return category?.Type == ServiceCategoryType.Exams;
            });

        // Conditional: elements required for TechnicalApplications category
        RuleFor(x => x.Contract.Elements)
            .NotNull().WithMessage("Contract elements is required for Technical Applications category.")
            .Must(elements => elements is not null && elements.Count > 0)
            .WithMessage("Contract elements must contain at least one entry for Technical Applications category.")
            .WhenAsync(async (cmd, ct) =>
            {
                if (cmd.ServiceCategoryId == Guid.Empty)
                {
                    return false;
                }
                var category = await _categoryRepository.GetByIdAsync(cmd.ServiceCategoryId, ct);
                return category?.Type == ServiceCategoryType.TechnicalApplications;
            });
    }
}

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, ServiceDto>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceCategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateServiceCommandHandler(
        IServiceRepository serviceRepository,
        IServiceCategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceDto> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.ServiceCategoryId, cancellationToken)
            ?? throw new InvalidOperationException($"ServiceCategory '{request.ServiceCategoryId}' does not exist.");

        var contractJson = JsonSerializer.Serialize(request.Contract);
        var contractDocument = JsonDocument.Parse(contractJson);

        var service = new Service
        {
            ServiceCategoryId = request.ServiceCategoryId,
            TenantId = request.TenantId,
            Name = request.Name,
            Group = request.Group,
            Code = request.Code,
            Description = request.Description,
            Contract = contractDocument
        };

        await _serviceRepository.AddAsync(service, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToDto(service, category, request.Contract);
    }

    private static ServiceDto MapToDto(Service service, ServiceCategory category, ContractDto contract) =>
        new(
            service.Id,
            service.ServiceCategoryId,
            category.Name,
            category.Type,
            service.TenantId,
            service.Name,
            service.Group,
            service.Code,
            service.Description,
            contract,
            service.CreatedAt
        );
}
