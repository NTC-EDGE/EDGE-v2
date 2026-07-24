using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalityById;

public class GetMunicipalityByIdQueryHandler(IGeographicRepository repository)
    : IRequestHandler<GetMunicipalityByIdQuery, ApiResponse<MunicipalityDto>>
{
    public async Task<ApiResponse<MunicipalityDto>> Handle(GetMunicipalityByIdQuery request, CancellationToken cancellationToken)
    {
        var municipality = await repository.GetMunicipalityByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Municipality not found.");

        var dto = new MunicipalityDto(
            municipality.Id,
            municipality.ProvinceId,
            municipality.Code,
            municipality.Name,
            municipality.IsActive,
            municipality.Province != null ? new ProvinceDto(
                municipality.Province.Id,
                municipality.Province.RegionId,
                municipality.Province.Code,
                municipality.Province.Name,
                municipality.Province.IsActive,
                municipality.Province.Region != null ? new RegionDto(municipality.Province.Region.Id, municipality.Province.Region.Code, municipality.Province.Region.Name, municipality.Province.Region.IsActive) : null
            ) : null
        );

        return ApiResponse<MunicipalityDto>.Success(dto, "Retrieved successfully.");
    }
}
