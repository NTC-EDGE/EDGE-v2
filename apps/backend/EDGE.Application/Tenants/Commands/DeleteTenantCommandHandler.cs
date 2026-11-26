using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Enums;

namespace EDGE.Application.Tenants.Commands;

public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, bool>
{
    private readonly ITenantRepository _tenantRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTenantCommandHandler(ITenantRepository tenantRepository, IUnitOfWork unitOfWork)
    {
        _tenantRepository = tenantRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _tenantRepository.GetByIdAsync(request.Id, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.Id}' was not found.");
        }

        var inFlightCounts = await _tenantRepository.GetInFlightApplicationCountsByStatusAsync(tenant.Id, cancellationToken)
                             ?? new Dictionary<ApplicationStatus, int>();
        var totalInFlight = inFlightCounts.Values.Where(c => c > 0).Sum();
        if (totalInFlight > 0)
        {
            var breakdown = ToggleTenantActiveCommandHandler.FormatInFlightBreakdown(inFlightCounts);
            throw new InvalidOperationException(
                $"Cannot delete Regional Office '{tenant.Name}' while {totalInFlight} application(s) are actively in-flight ({breakdown}). " +
                "All pending evaluations, accounting assessments, cashier collections, and document issuances must be completed first.");
        }

        _tenantRepository.Delete(tenant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
