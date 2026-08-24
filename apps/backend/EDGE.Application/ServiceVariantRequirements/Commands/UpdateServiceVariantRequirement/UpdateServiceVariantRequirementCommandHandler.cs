using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;

public class UpdateServiceVariantRequirementCommandHandler(
    IServiceVariantRequirementRepository repository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateServiceVariantRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateServiceVariantRequirementCommand request, CancellationToken cancellationToken)
    {
        var svr = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (svr == null)
        {
            return ApiResponse<Guid>.Fail($"Service Variant Requirement with ID '{request.Id}' was not found.");
        }

        if (request.RequirementId.HasValue && request.RequirementId.Value != Guid.Empty)
        {
            svr.RequirementId = request.RequirementId.Value;
        }
        if (request.ServiceVariantId.HasValue && request.ServiceVariantId.Value != Guid.Empty)
        {
            svr.ServiceVariantId = request.ServiceVariantId.Value;
        }
        svr.IsRequired = request.IsRequired;
        if (request.TenantId.HasValue) svr.TenantId = request.TenantId;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(svr.Id, "Service Variant Requirement updated successfully.");
    }
}
