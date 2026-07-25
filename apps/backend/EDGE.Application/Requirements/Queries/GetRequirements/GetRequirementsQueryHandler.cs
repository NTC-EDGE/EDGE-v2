using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetRequirements;

public class GetRequirementsQueryHandler(IRequirementRepository repository)
    : IRequestHandler<GetRequirementsQuery, ApiResponse<List<RequirementDto>>>
{
    public async Task<ApiResponse<List<RequirementDto>>> Handle(GetRequirementsQuery request, CancellationToken cancellationToken)
    {
        var requirements = await repository.GetAllAsync(cancellationToken);

        var dtos = requirements.Select(r => new RequirementDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description
        }).ToList();

        return ApiResponse<List<RequirementDto>>.Success(dtos);
    }
}
