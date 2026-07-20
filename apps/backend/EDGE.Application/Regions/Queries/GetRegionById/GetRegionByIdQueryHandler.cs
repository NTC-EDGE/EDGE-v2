using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Regions.Queries.GetRegionById;

public class GetRegionByIdQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetRegionByIdQuery, ApiResponse<RegionDto>>
{
    public async Task<ApiResponse<RegionDto>> Handle(GetRegionByIdQuery request, CancellationToken cancellationToken)
    {
        var region = await repository.GetRegionByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Region not found.");

        var dto = new RegionDto(region.Id, region.Code, region.Name, region.IsActive);

        return ApiResponse<RegionDto>.Success(dto, "Retrieved successfully.");
    }
}
