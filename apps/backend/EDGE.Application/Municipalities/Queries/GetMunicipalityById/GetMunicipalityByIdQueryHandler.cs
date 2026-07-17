using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Municipalities.Dtos;

namespace EDGE.Application.Municipalities.Queries.GetMunicipalityById;

public class GetMunicipalityByIdQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetMunicipalityByIdQuery, ApiResponse<MunicipalityDto>>
{
    public async Task<ApiResponse<MunicipalityDto>> Handle(GetMunicipalityByIdQuery request, CancellationToken cancellationToken)
    {
        var municipality = await repository.GetMunicipalityByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Municipality not found.");

        var dto = new MunicipalityDto(municipality.Id, municipality.ProvinceId, municipality.Code, municipality.Name, municipality.IsActive);

        return ApiResponse<MunicipalityDto>.Success(dto, "Retrieved successfully.");
    }
}
