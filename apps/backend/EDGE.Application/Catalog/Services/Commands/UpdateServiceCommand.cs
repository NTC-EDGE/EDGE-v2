using System.Text.Json;
using MediatR;
using FluentValidation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Catalog.Services.DTOs;

namespace EDGE.Application.Catalog.Services.Commands;

public record UpdateServiceCommand(
    Guid Id,
    Guid ServiceCategoryId,
    Guid TenantId,
    string Name,
    string? Group,
    string? Code,
    string? Description,
    ContractDto Contract
) : IRequest<ServiceDto>;

public class UpdateServiceCommandValidator : AbstractValidator<UpdateServiceCommand>
{
    private readonly IServiceCategoryRepository _categoryRepository;

    public UpdateServiceCommandValidator(IServiceCategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Service ID is required.");

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

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, ServiceDto>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceCategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateServiceCommandHandler(
        IServiceRepository serviceRepository,
        IServiceCategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _serviceRepository = serviceRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceDto> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException($"Service with ID '{request.Id}' was not found.");

        var category = await _categoryRepository.GetByIdAsync(request.ServiceCategoryId, cancellationToken)
            ?? throw new InvalidOperationException($"ServiceCategory '{request.ServiceCategoryId}' does not exist.");

        var contractJson = JsonSerializer.Serialize(request.Contract);
        service.Contract.Dispose();
        service.Contract = JsonDocument.Parse(contractJson);

        service.ServiceCategoryId = request.ServiceCategoryId;
        service.TenantId = request.TenantId;
        service.Name = request.Name;
        service.Group = request.Group;
        service.Code = request.Code;
        service.Description = request.Description;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ServiceDto(
            service.Id,
            service.ServiceCategoryId,
            category.Name,
            category.Type,
            service.TenantId,
            service.Name,
            service.Group,
            service.Code,
            service.Description,
            request.Contract,
            service.CreatedAt
        );
    }
}
