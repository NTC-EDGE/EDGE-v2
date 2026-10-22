using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceInformations.Dtos;

namespace EDGE.Application.ServiceInformations.Queries.GetServiceInformations;

public class GetServiceInformationsQueryHandler(IServiceInformationRepository repository)
    : IRequestHandler<GetServiceInformationsQuery, PaginatedApiResponse<ServiceInformationDto>>
{
    public async Task<PaginatedApiResponse<ServiceInformationDto>> Handle(GetServiceInformationsQuery request, CancellationToken cancellationToken)
    {
        int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        int pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var (items, totalCount) = await repository.GetPagedAsync(
            request.Search,
            request.ServiceId,
            pageNumber,
            pageSize,
            cancellationToken
        );

        var dtos = items.Select(x => new ServiceInformationDto(
            x.Id,
            x.ServiceId,
            x.Service?.ServiceCategory?.Name ?? string.Empty,
            x.Service?.Name ?? string.Empty,
            x.Information,
            x.WhoMayAvail
        )).ToList();

        return new PaginatedApiResponse<ServiceInformationDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
