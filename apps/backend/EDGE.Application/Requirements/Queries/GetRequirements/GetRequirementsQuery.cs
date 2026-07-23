using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetRequirements;

public record GetRequirementsQuery() : IRequest<ApiResponse<List<RequirementDto>>>;

public class GetRequirementsQueryHandler : IRequestHandler<GetRequirementsQuery, ApiResponse<List<RequirementDto>>>
{
    private readonly IRequirementRepository _repository;

    public GetRequirementsQueryHandler(IRequirementRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<List<RequirementDto>>> Handle(GetRequirementsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetRequirementsAsync(cancellationToken);
        var list = entities.Select(r => new RequirementDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description,
            CreatedAt = r.CreatedAt
        }).ToList();

        return ApiResponse<List<RequirementDto>>.Success(list, "Master requirements retrieved successfully.");
    }
}
