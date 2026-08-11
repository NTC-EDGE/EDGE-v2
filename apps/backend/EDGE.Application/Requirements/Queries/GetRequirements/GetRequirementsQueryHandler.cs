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
    : IRequestHandler<GetRequirementsQuery, PaginatedApiResponse<RequirementDto>>
{
    public async Task<PaginatedApiResponse<RequirementDto>> Handle(GetRequirementsQuery request, CancellationToken cancellationToken)
    {
        var requirements = await repository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            requirements = requirements.Where(r =>
                r.Name.ToLower().Contains(search) ||
                (r.Description != null && r.Description.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = requirements.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = requirements.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(r => new RequirementDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description
        }).ToList();

        return new PaginatedApiResponse<RequirementDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
