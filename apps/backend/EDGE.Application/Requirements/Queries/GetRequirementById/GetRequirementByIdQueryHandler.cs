using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetRequirementById;

public class GetRequirementByIdQueryHandler(IRequirementRepository repository)
    : IRequestHandler<GetRequirementByIdQuery, ApiResponse<RequirementDto>>
{
    public async Task<ApiResponse<RequirementDto>> Handle(GetRequirementByIdQuery request, CancellationToken cancellationToken)
    {
        var requirement = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (requirement == null)
        {
            return ApiResponse<RequirementDto>.Fail($"Requirement with ID '{request.Id}' was not found.");
        }

        var dto = new RequirementDto
        {
            Id = requirement.Id,
            Name = requirement.Name,
            Description = requirement.Description
        };

        return ApiResponse<RequirementDto>.Success(dto);
    }
}
