using MediatR;
using EDGE.Application.Tenants.DTOs;
using EDGE.Application.Common.Interfaces;
using FluentValidation;

namespace EDGE.Application.Tenants.Commands;

public record UpdateTenantCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive
) : IRequest<TenantDto?>;

public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Tenant ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant Name is required.")
            .MaximumLength(150).WithMessage("Tenant Name must not exceed 150 characters.");
    }
}

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, TenantDto?>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto?> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (tenant == null) return null;

        tenant.Name = request.Name;
        tenant.Description = request.Description;
        tenant.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantDto(tenant.Id, tenant.Name, tenant.Slug, tenant.Description, tenant.IsActive, tenant.CreatedAt);
    }
}
