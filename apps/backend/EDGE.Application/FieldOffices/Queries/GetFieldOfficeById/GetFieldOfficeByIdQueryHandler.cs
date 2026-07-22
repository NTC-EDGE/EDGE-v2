using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.Dtos;

namespace EDGE.Application.FieldOffices.Queries.GetFieldOfficeById;

public class GetFieldOfficeByIdQueryHandler(IFieldOfficeRepository repository) : IRequestHandler<GetFieldOfficeByIdQuery, ApiResponse<FieldOfficeDto>>
{
    public async Task<ApiResponse<FieldOfficeDto>> Handle(GetFieldOfficeByIdQuery request, CancellationToken cancellationToken)
    {
        var fieldOffice = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (fieldOffice == null)
        {
            return ApiResponse<FieldOfficeDto>.Fail("Field office not found.");
        }

        var dto = new FieldOfficeDto(fieldOffice.Id, fieldOffice.Name, fieldOffice.Code, fieldOffice.RegionId, fieldOffice.Region?.Name);
        return ApiResponse<FieldOfficeDto>.Success(dto);
    }
}
