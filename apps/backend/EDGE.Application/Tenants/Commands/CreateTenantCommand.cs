using MediatR;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using FluentValidation;

namespace EDGE.Application.Tenants.Commands;

public record CreateTenantCommand(
    string Name,
    string Slug,
    string? Description
) : IRequest<TenantDto>;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant Name is required.")
            .MaximumLength(150).WithMessage("Tenant Name must not exceed 150 characters.");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Tenant Slug is required.")
            .MaximumLength(50).WithMessage("Tenant Slug must not exceed 50 characters.")
            .Matches("^[a-z0-9-]+$").WithMessage("Tenant Slug must contain only lowercase letters, numbers, and hyphens.");
    }
}

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var existing = await _tenantRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existing != null)
        {
            throw new InvalidOperationException($"Tenant with slug '{request.Slug}' already exists.");
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Slug = request.Slug.ToLowerInvariant(),
            Description = request.Description,
            IsActive = true
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantDto(tenant.Id, tenant.Name, tenant.Slug, tenant.Description, tenant.IsActive, tenant.CreatedAt);
    }
}
