using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalities;

public class GetMunicipalitiesQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetMunicipalitiesQuery, ApiResponse<List<MunicipalityDto>>>
{
    public async Task<ApiResponse<List<MunicipalityDto>>> Handle(GetMunicipalitiesQuery request, CancellationToken cancellationToken)
    {
        var municipalities = await repository.GetMunicipalitiesAsync(request.ProvinceId, request.ActiveOnly, cancellationToken);
        var dtos = municipalities.Select(m => new MunicipalityDto(
            m.Id, 
            m.ProvinceId, 
            m.Code, 
            m.Name, 
            m.IsActive,
            m.Province != null ? new ProvinceDto(
                m.Province.Id,
                m.Province.RegionId,
                m.Province.Code,
                m.Province.Name,
                m.Province.IsActive,
                m.Province.Region != null ? new RegionDto(m.Province.Region.Id, m.Province.Region.Code, m.Province.Region.Name, m.Province.Region.IsActive) : null
            ) : null
        )).ToList();

        return ApiResponse<List<MunicipalityDto>>.Success(dtos, "Retrieved successfully.");
    }
}
