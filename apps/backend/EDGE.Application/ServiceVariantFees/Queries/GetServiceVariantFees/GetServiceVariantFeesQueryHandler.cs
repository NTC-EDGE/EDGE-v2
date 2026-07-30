using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Application.Common.Interfaces;

using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;

public class GetServiceVariantFeesQueryHandler : IRequestHandler<GetServiceVariantFeesQuery, PaginatedApiResponse<ServiceVariantFeeDto>>
{
    private readonly IServiceVariantFeeRepository _repository;

    public GetServiceVariantFeesQueryHandler(IServiceVariantFeeRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantFeeDto>> Handle(GetServiceVariantFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            fees = fees.Where(svf => 
                (svf.ServiceVariant?.Service != null && svf.ServiceVariant.Service.Name.ToLower().Contains(search)) || 
                (svf.ServiceVariant != null && svf.ServiceVariant.Type.ToString().ToLower().Contains(search)) || 
                (svf.Fee != null && svf.Fee.Code.ToLower().Contains(search)) || 
                (svf.Fee != null && svf.Fee.Name.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = fees.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = fees.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(svf => new ServiceVariantFeeDto(
            svf.Id,
            svf.ServiceVariantId,
            svf.ServiceVariant != null ? new ServiceVariantDetailDto(
                svf.ServiceVariant.Id,
                svf.ServiceVariant.ServiceId,
                svf.ServiceVariant.Service?.Name,
                svf.ServiceVariant.Type.ToString()
            ) : null,
            svf.FeeId,
            svf.Fee?.Code,
            svf.Fee?.Name,
            svf.Amount,
            svf.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ServiceVariantFeeDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
