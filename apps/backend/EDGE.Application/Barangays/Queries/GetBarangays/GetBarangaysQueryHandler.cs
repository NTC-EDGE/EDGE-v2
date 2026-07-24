using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;
using EDGE.Application.Municipalities.Dtos;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangays;

public class GetBarangaysQueryHandler(IGeographicRepository repository)
    : IRequestHandler<GetBarangaysQuery, ApiResponse<List<BarangayDto>>>
{
    public async Task<ApiResponse<List<BarangayDto>>> Handle(GetBarangaysQuery request, CancellationToken cancellationToken)
    {
        var barangays = await repository.GetBarangaysAsync(request.MunicipalityId, request.ActiveOnly, cancellationToken);
        var dtos = barangays.Select(b => new BarangayDto(
            b.Id,
            b.MunicipalityId,
            b.Code,
            b.Name,
            b.IsActive,
            b.Municipality != null ? new MunicipalityDto(
                b.Municipality.Id,
                b.Municipality.ProvinceId,
                b.Municipality.Code,
                b.Municipality.Name,
                b.Municipality.IsActive,
                b.Municipality.Province != null ? new ProvinceDto(
                    b.Municipality.Province.Id,
                    b.Municipality.Province.RegionId,
                    b.Municipality.Province.Code,
                    b.Municipality.Province.Name,
                    b.Municipality.Province.IsActive,
                    b.Municipality.Province.Region != null ? new RegionDto(b.Municipality.Province.Region.Id, b.Municipality.Province.Region.Code, b.Municipality.Province.Region.Name, b.Municipality.Province.Region.IsActive) : null
                ) : null
            ) : null
        )).ToList();

        return ApiResponse<List<BarangayDto>>.Success(dtos, "Retrieved successfully.");
    }
}
