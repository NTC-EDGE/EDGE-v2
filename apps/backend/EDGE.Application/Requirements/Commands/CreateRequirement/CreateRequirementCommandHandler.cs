using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;

namespace EDGE.Application.Requirements.Commands.CreateRequirement;

public class CreateRequirementCommandHandler(IRequirementRepository repository, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateRequirementCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateRequirementCommand request, CancellationToken cancellationToken)
    {
        var requirement = new Requirement
        {
            Name = request.Name,
            Description = request.Description
        };

        await repository.AddAsync(requirement, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(requirement.Id, "Requirement created successfully.");
    }
}
