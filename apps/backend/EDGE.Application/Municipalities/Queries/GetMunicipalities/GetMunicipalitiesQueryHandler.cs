using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalities;

public class GetMunicipalitiesQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetMunicipalitiesQuery, ApiResponse<List<MunicipalityDto>>>
{
    public async Task<ApiResponse<List<MunicipalityDto>>> Handle(GetMunicipalitiesQuery request, CancellationToken cancellationToken)
    {
        var municipalities = await repository.GetMunicipalitiesAsync(request.ProvinceId, request.ActiveOnly, cancellationToken);
        var dtos = municipalities.Select(m => new MunicipalityDto(m.Id, m.ProvinceId, m.Code, m.Name, m.IsActive)).ToList();
        return ApiResponse<List<MunicipalityDto>>.Success(dtos, "Retrieved successfully.");
    }
}
