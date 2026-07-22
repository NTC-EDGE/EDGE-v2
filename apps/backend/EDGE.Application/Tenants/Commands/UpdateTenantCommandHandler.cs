using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.Id}' was not found.");
        }

        var normalizedCode = request.Code.ToUpperInvariant();

        // Check if another tenant is already using this code
        var existingTenantWithCode = await _tenantRepository.GetByCodeAsync(normalizedCode, cancellationToken);
        if (existingTenantWithCode != null && existingTenantWithCode.Id != request.Id)
        {
            throw new InvalidOperationException($"Tenant with code '{request.Code}' is already in use by another tenant.");
        }

        tenant.Name = request.Name;
        tenant.Code = normalizedCode;
        tenant.Description = request.Description;
        tenant.IsActive = request.IsActive;
        tenant.RegionId = request.RegionId;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TenantDto
        {
            Id = tenant.Id,
            Name = tenant.Name,
            Code = tenant.Code,
            Description = tenant.Description,
            IsActive = tenant.IsActive,
            RegionId = tenant.RegionId,
            CreatedAt = tenant.CreatedAt,
            CreatedBy = tenant.CreatedBy,
            LastModifiedAt = tenant.LastModifiedAt,
            LastModifiedBy = tenant.LastModifiedBy
        };
    }
}
