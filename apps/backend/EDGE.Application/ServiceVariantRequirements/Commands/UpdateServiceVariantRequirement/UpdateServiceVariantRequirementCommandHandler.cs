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

        svr.RequirementId = request.RequirementId;
        svr.ServiceVariantId = request.ServiceVariantId;
        svr.ApplicationTypeKey = request.ApplicationTypeKey;
        svr.IsRequired = request.IsRequired;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(svr.Id, "Service Variant Requirement updated successfully.");
    }
}
