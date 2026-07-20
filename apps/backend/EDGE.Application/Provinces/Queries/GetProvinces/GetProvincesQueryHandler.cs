using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Provinces.Queries.GetProvinces;

public class GetProvincesQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetProvincesQuery, ApiResponse<List<ProvinceDto>>>
{
    public async Task<ApiResponse<List<ProvinceDto>>> Handle(GetProvincesQuery request, CancellationToken cancellationToken)
    {
        var provinces = await repository.GetProvincesAsync(request.RegionId, request.ActiveOnly, cancellationToken);
        var dtos = provinces.Select(p => new ProvinceDto(
            p.Id, 
            p.RegionId, 
            p.Code, 
            p.Name, 
            p.IsActive,
            p.Region != null ? new RegionDto(p.Region.Id, p.Region.Code, p.Region.Name, p.Region.IsActive) : null
        )).ToList();
        
        return ApiResponse<List<ProvinceDto>>.Success(dtos, "Retrieved successfully.");
    }
}
