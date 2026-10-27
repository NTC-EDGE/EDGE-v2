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
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var (items, totalCount) = await repository.GetPagedAsync(
            request.SearchTerm,
            pageNumber,
            pageSize,
            cancellationToken);

        var dtos = items.Select(r => new RequirementDto
        {
            Id = r.Id,
            Name = r.Name,
            Description = r.Description
        }).ToList();

        return new PaginatedApiResponse<RequirementDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
