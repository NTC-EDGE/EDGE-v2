using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceInformations.Dtos;

namespace EDGE.Application.ServiceInformations.Queries.GetServiceInformationById;

public class GetServiceInformationByIdQueryHandler(IServiceInformationRepository repository)
    : IRequestHandler<GetServiceInformationByIdQuery, ApiResponse<ServiceInformationDto>>
{
    public async Task<ApiResponse<ServiceInformationDto>> Handle(GetServiceInformationByIdQuery request, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (item == null)
        {
            return ApiResponse<ServiceInformationDto>.Fail($"ServiceInformation with ID '{request.Id}' was not found.");
        }

        var dto = new ServiceInformationDto(
            item.Id,
            item.ServiceId,
            item.Service?.ServiceCategory?.Name ?? string.Empty,
            item.Service?.Name ?? string.Empty,
            item.Information,
            item.WhoMayAvail
        );

        return ApiResponse<ServiceInformationDto>.Success(dto);
    }
}
