using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.Tenants.Commands;

public class ToggleTenantActiveCommandHandler : IRequestHandler<ToggleTenantActiveCommand, TenantDto>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleTenantActiveCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TenantDto> Handle(ToggleTenantActiveCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.Id}' was not found.");
        }

        // Prevent deactivating a Regional Office while applications are actively in-flight
        if (tenant.IsActive)
        {
            var inFlightCounts = await _tenantRepository.GetInFlightApplicationCountsByStatusAsync(tenant.Id, cancellationToken)
                                 ?? new Dictionary<ApplicationStatus, int>();
            var totalInFlight = inFlightCounts.Values.Where(c => c > 0).Sum();
            if (totalInFlight > 0)
            {
                var breakdown = FormatInFlightBreakdown(inFlightCounts);
                throw new InvalidOperationException(
                    $"Cannot deactivate Regional Office '{tenant.Name}' while {totalInFlight} application(s) are actively in-flight ({breakdown}). " +
                    "All pending evaluations, accounting assessments, cashier collections, and document issuances must be completed before deactivating this tenant.");
            }
        }

        tenant.IsActive = !tenant.IsActive;

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

    internal static string FormatInFlightBreakdown(Dictionary<ApplicationStatus, int> counts)
    {
        var parts = new List<string>();
        foreach (var kvp in counts.Where(k => k.Value > 0).OrderBy(k => k.Key))
        {
            var label = kvp.Key switch
            {
                ApplicationStatus.Submitted => "Submitted in Evaluator Queue",
                ApplicationStatus.Evaluating => "Under Evaluation",
                ApplicationStatus.Returned => "Returned Awaiting Client Compliance",
                ApplicationStatus.ForAccountant => "With Accountant for SOA Review",
                ApplicationStatus.PendingPayment => "Pending Cashier Payment / Collection",
                ApplicationStatus.ForIssuance => "Paid & Awaiting Document Issuance",
                _ => kvp.Key.ToString()
            };
            parts.Add($"{kvp.Value} {label}");
        }
        return string.Join(", ", parts);
    }
}
