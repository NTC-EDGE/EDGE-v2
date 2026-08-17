using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;

namespace EDGE.Application.Tenants.Commands;

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
        var existingTenant = await _tenantRepository.GetByCodeAsync(request.Code, cancellationToken);
        if (existingTenant != null)
        {
            throw new InvalidOperationException($"Tenant with code '{request.Code}' already exists.");
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Code = request.Code.ToUpperInvariant(), // Normalize tenant code to upper case
            Description = request.Description,
            IsActive = request.IsActive,
            RegionId = request.RegionId
        };

        await _tenantRepository.AddAsync(tenant, cancellationToken);
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
