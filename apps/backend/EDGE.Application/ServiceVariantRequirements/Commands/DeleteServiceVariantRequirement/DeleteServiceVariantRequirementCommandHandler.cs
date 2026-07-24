using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.DeleteServiceVariantRequirement;

public class DeleteServiceVariantRequirementCommandHandler(
    IServiceVariantRequirementRepository repository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteServiceVariantRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeleteServiceVariantRequirementCommand request, CancellationToken cancellationToken)
    {
        var svr = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (svr == null)
        {
            return ApiResponse<Guid>.Fail($"Service Variant Requirement with ID '{request.Id}' was not found.");
        }

        repository.Delete(svr);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(svr.Id, "Service Variant Requirement deleted successfully.");
    }
}
