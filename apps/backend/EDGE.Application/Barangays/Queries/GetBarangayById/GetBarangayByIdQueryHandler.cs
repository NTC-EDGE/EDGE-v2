using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;
using EDGE.Application.Municipalities.Dtos;
using EDGE.Application.Provinces.Dtos;
using EDGE.Application.Regions.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangayById;

public class GetBarangayByIdQueryHandler(IGeographicRepository repository)
    : IRequestHandler<GetBarangayByIdQuery, ApiResponse<BarangayDto>>
{
    public async Task<ApiResponse<BarangayDto>> Handle(GetBarangayByIdQuery request, CancellationToken cancellationToken)
    {
        var barangay = await repository.GetBarangayByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Barangay not found.");

        var dto = new BarangayDto(
            barangay.Id,
            barangay.MunicipalityId,
            barangay.Code,
            barangay.Name,
            barangay.IsActive,
            barangay.Municipality != null ? new MunicipalityDto(
                barangay.Municipality.Id,
                barangay.Municipality.ProvinceId,
                barangay.Municipality.Code,
                barangay.Municipality.Name,
                barangay.Municipality.IsActive,
                barangay.Municipality.Province != null ? new ProvinceDto(
                    barangay.Municipality.Province.Id,
                    barangay.Municipality.Province.RegionId,
                    barangay.Municipality.Province.Code,
                    barangay.Municipality.Province.Name,
                    barangay.Municipality.Province.IsActive,
                    barangay.Municipality.Province.Region != null ? new RegionDto(barangay.Municipality.Province.Region.Id, barangay.Municipality.Province.Region.Code, barangay.Municipality.Province.Region.Name, barangay.Municipality.Province.Region.IsActive) : null
                ) : null
            ) : null
        );

        return ApiResponse<BarangayDto>.Success(dto, "Retrieved successfully.");
    }
}
