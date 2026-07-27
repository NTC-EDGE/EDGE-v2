using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.DeleteRequirement;

public class DeleteRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(DeleteRequirementCommand request, CancellationToken cancellationToken)
    {
        var requirement = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (requirement == null)
        {
            return ApiResponse<Guid>.Fail($"Requirement with ID '{request.Id}' was not found.");
        }

        repository.Delete(requirement);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(requirement.Id, "Requirement deleted successfully.");
    }
}
