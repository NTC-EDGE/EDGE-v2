using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Fees.DTOs;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Fees.Queries;

public record GetFeesQuery(
    bool? ActiveOnly = null,
    int? PageNumber = null,
    int? PageSize = null,
    string? SearchTerm = null
) : IRequest<PaginatedApiResponse<FeeDto>>;

public class GetFeesQueryHandler : IRequestHandler<GetFeesQuery, PaginatedApiResponse<FeeDto>>
{
    private readonly IFeeRepository _feeRepository;

    public GetFeesQueryHandler(IFeeRepository feeRepository)
    {
        _feeRepository = feeRepository;
    }

    public async Task<PaginatedApiResponse<FeeDto>> Handle(GetFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = await _feeRepository.GetAllAsync(request.ActiveOnly, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            fees = fees.Where(f => 
                f.Code.ToLower().Contains(search) || 
                f.Name.ToLower().Contains(search) || 
                (f.Description != null && f.Description.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = fees.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = fees.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(f => new FeeDto(
            f.Id,
            f.Code,
            f.Name,
            f.Description,
            f.IsActive,
            f.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<FeeDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
