using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Provinces.Queries.GetProvinceById;

public class GetProvinceByIdQueryHandler(IGeographicRepository repository)
    : IRequestHandler<GetProvinceByIdQuery, ApiResponse<ProvinceDto>>
{
    public async Task<ApiResponse<ProvinceDto>> Handle(GetProvinceByIdQuery request, CancellationToken cancellationToken)
    {
        var province = await repository.GetProvinceByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Province not found.");

        var dto = new ProvinceDto(
            province.Id,
            province.RegionId,
            province.Code,
            province.Name,
            province.IsActive,
            province.Region != null ? new RegionDto(province.Region.Id, province.Region.Code, province.Region.Name, province.Region.IsActive) : null
        );

        return ApiResponse<ProvinceDto>.Success(dto, "Retrieved successfully.");
    }
}
