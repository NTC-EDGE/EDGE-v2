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
        var rawFees = await _feeRepository.GetAllAsync(request.ActiveOnly, cancellationToken);

        // Deduplicate by canonical fee code and fee name so legacy or synonymous codes
        // (e.g., FILING_FEE vs FF, INSP_FEE vs IF, LIC vs LF, PERMIT vs PF, POSS_PERMIT vs POS, EXAM_REG_FEE vs EXAM)
        // never appear as duplicate fees in catalog selectors.
        var seenCodes = new HashSet<string>(System.StringComparer.OrdinalIgnoreCase);
        var seenNames = new HashSet<string>(System.StringComparer.OrdinalIgnoreCase);
        var fees = new List<EDGE.Domain.Entities.Fee>();

        foreach (var f in rawFees.OrderBy(x => x.Code.Length).ThenBy(x => x.Name))
        {
            var canonicalCode = EDGE.Domain.Constants.FeeConstants.Codes.NormalizeCanonicalCode(f.Code, f.Name);
            var normName = (f.Name ?? string.Empty).Trim();
            if (!seenCodes.Add(canonicalCode) || (!string.IsNullOrEmpty(normName) && !seenNames.Add(normName)))
            {
                continue;
            }
            fees.Add(f);
        }

        fees = fees.OrderBy(f => f.Name).ToList();

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
