using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Regions.Queries.GetRegions;

public class GetRegionsQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetRegionsQuery, ApiResponse<List<RegionDto>>>
{
    public async Task<ApiResponse<List<RegionDto>>> Handle(GetRegionsQuery request, CancellationToken cancellationToken)
    {
        var regions = await repository.GetRegionsAsync(request.ActiveOnly, cancellationToken);
        var dtos = regions.Select(r => new RegionDto(r.Id, r.Code, r.Name, r.IsActive)).ToList();
        return ApiResponse<List<RegionDto>>.Success(dtos, "Retrieved successfully.");
    }
}
