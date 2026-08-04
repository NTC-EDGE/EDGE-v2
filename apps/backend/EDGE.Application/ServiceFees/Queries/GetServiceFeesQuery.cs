using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceFees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceFees.Queries;

public record GetServiceFeesQuery(
    Guid? ServiceId = null,
    Guid? FeeId = null,
    bool? ActiveOnly = null,
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<ServiceFeeDto>>;

public class GetServiceFeesQueryHandler : IRequestHandler<GetServiceFeesQuery, PaginatedApiResponse<ServiceFeeDto>>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;

    public GetServiceFeesQueryHandler(IServiceFeeRepository serviceFeeRepository)
    {
        _serviceFeeRepository = serviceFeeRepository;
    }

    public async Task<PaginatedApiResponse<ServiceFeeDto>> Handle(GetServiceFeesQuery request, CancellationToken cancellationToken)
    {
        var serviceFees = await _serviceFeeRepository.GetAllAsync(
            request.ServiceId,
            request.FeeId,
            request.ActiveOnly,
            cancellationToken
        );

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            serviceFees = serviceFees.Where(sf => 
                (sf.Service != null && sf.Service.Name != null && sf.Service.Name.ToLower().Contains(search)) || 
                (sf.Service != null && sf.Service.Code != null && sf.Service.Code.ToLower().Contains(search)) || 
                (sf.Fee != null && sf.Fee.Code != null && sf.Fee.Code.ToLower().Contains(search)) || 
                (sf.Fee != null && sf.Fee.Name != null && sf.Fee.Name.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = serviceFees.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = serviceFees.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(sf => new ServiceFeeDto(
            sf.Id,
            sf.ServiceId,
            sf.Service?.Name,
            sf.Service?.Code,
            sf.FeeId,
            sf.Fee?.Code,
            sf.Fee?.Name,
            sf.Amount,
            sf.IsActive,
            sf.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ServiceFeeDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
