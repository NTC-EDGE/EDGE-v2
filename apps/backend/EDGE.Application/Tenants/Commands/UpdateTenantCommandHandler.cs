using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
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

        // Prevent deactivating a Regional Office while applications are actively in-flight
        if (tenant.IsActive && !request.IsActive)
        {
            var inFlightCounts = await _tenantRepository.GetInFlightApplicationCountsByStatusAsync(tenant.Id, cancellationToken)
                                 ?? new Dictionary<ApplicationStatus, int>();
            var totalInFlight = inFlightCounts.Values.Where(c => c > 0).Sum();
            if (totalInFlight > 0)
            {
                var breakdown = ToggleTenantActiveCommandHandler.FormatInFlightBreakdown(inFlightCounts);
                throw new InvalidOperationException(
                    $"Cannot deactivate Regional Office '{tenant.Name}' while {totalInFlight} application(s) are actively in-flight ({breakdown}). " +
                    "All pending evaluations, accounting assessments, cashier collections, and document issuances must be completed before deactivating this tenant.");
            }
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
