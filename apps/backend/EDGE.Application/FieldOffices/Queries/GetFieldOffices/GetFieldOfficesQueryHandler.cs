using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOffices;

public class GetFieldOfficesQueryHandler(IFieldOfficeRepository repository) : IRequestHandler<GetFieldOfficesQuery, ApiResponse<List<FieldOfficeDto>>>
{
    public async Task<ApiResponse<List<FieldOfficeDto>>> Handle(GetFieldOfficesQuery request, CancellationToken cancellationToken)
    {
        var fieldOffices = await repository.GetAllAsync(request.RegionId, cancellationToken);
        var dtos = fieldOffices.Select(f => new FieldOfficeDto(f.Id, f.Name, f.Code, f.RegionId, f.Region?.Name)).ToList();
        return ApiResponse<List<FieldOfficeDto>>.Success(dtos);
    }
}
