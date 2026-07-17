using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Application.Common.Models;
using EDGE.Application.Barangays.Dtos;

namespace EDGE.Application.Barangays.Queries.GetBarangayById;

public class GetBarangayByIdQueryHandler(IGeographicRepository repository) 
    : IRequestHandler<GetBarangayByIdQuery, ApiResponse<BarangayDto>>
{
    public async Task<ApiResponse<BarangayDto>> Handle(GetBarangayByIdQuery request, CancellationToken cancellationToken)
    {
        var barangay = await repository.GetBarangayByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Barangay not found.");

        var dto = new BarangayDto(barangay.Id, barangay.MunicipalityId, barangay.Code, barangay.Name, barangay.IsActive);

        return ApiResponse<BarangayDto>.Success(dto, "Retrieved successfully.");
    }
}
