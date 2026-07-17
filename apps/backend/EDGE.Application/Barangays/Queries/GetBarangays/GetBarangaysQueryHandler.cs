using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangays;

public class GetBarangaysQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetBarangaysQuery, ApiResponse<List<BarangayDto>>>
{
    public async Task<ApiResponse<List<BarangayDto>>> Handle(GetBarangaysQuery request, CancellationToken cancellationToken)
    {
        var barangays = await repository.GetBarangaysAsync(request.MunicipalityId, request.ActiveOnly, cancellationToken);
        var dtos = barangays.Select(b => new BarangayDto(b.Id, b.MunicipalityId, b.Code, b.Name, b.IsActive)).ToList();
        return ApiResponse<List<BarangayDto>>.Success(dtos, "Retrieved successfully.");
    }
}
