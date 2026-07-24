using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.UpdateRequirement;

public class UpdateRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateRequirementCommand request, CancellationToken cancellationToken)
    {
        var requirement = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (requirement == null)
        {
            return ApiResponse<Guid>.Fail($"Requirement with ID '{request.Id}' was not found.");
        }

        requirement.Name = request.Name;
        requirement.Description = request.Description;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(requirement.Id, "Requirement updated successfully.");
    }
}
