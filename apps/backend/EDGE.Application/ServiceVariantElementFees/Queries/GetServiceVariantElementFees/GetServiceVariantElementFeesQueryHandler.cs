using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;

public class GetServiceVariantElementFeesQueryHandler : IRequestHandler<GetServiceVariantElementFeesQuery, PaginatedApiResponse<ServiceVariantElementFeeGroupDto>>
{
    private readonly IServiceVariantElementFeeRepository _repository;
    private readonly IServiceVariantFormulaRepository _formulaRepository;

    public GetServiceVariantElementFeesQueryHandler(
        IServiceVariantElementFeeRepository repository,
        IServiceVariantFormulaRepository formulaRepository)
    {
        _repository = repository;
        _formulaRepository = formulaRepository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantElementFeeGroupDto>> Handle(GetServiceVariantElementFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        var elementFormulas = await _formulaRepository.GetAllElementFormulasAsync(cancellationToken);

        if (request.ElementId.HasValue)
        {
            fees = fees.Where(svef => svef.ElementId == request.ElementId.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            fees = fees.Where(svef => 
                (svef.ServiceVariant?.Service != null && svef.ServiceVariant.Service.Name.ToLower().Contains(search)) || 
                (svef.ServiceVariant != null && svef.ServiceVariant.Type.ToString().ToLower().Contains(search)) || 
                (svef.Element != null && svef.Element.Code.ToLower().Contains(search)) || 
                (svef.Element != null && svef.Element.Name.ToLower().Contains(search)) || 
                (svef.Fee != null && svef.Fee.Code.ToLower().Contains(search)) || 
                (svef.Fee != null && svef.Fee.Name.ToLower().Contains(search))
            ).ToList();
        }

        var allDtos = fees.Select(svef => new ServiceVariantElementFeeDto(
            svef.Id,
            svef.ServiceVariantId,
            svef.ServiceVariant != null ? new ServiceVariantDetailDto(
                svef.ServiceVariant.Id,
                svef.ServiceVariant.ServiceId,
                svef.ServiceVariant.Service?.Name,
                svef.ServiceVariant.Type.ToString()
            ) : null,
            svef.ElementId,
            svef.Element?.Code,
            svef.Element?.Name,
            svef.FeeId,
            svef.Fee?.Code,
            svef.Fee?.Name,
            svef.Amount,
            svef.IsActive,
            svef.CreatedAt
        )).ToList();

        var groups = allDtos
            .GroupBy(svef => new {
                svef.ServiceVariantId,
                ServiceId = svef.ServiceVariant?.ServiceId,
                ServiceName = svef.ServiceVariant?.ServiceName,
                VariantType = svef.ServiceVariant?.Type
            })
            .Select(g => {
                var firstFee = g.FirstOrDefault();
                var ef = firstFee != null
                    ? elementFormulas.FirstOrDefault(f => f.ServiceVariantId == g.Key.ServiceVariantId && f.ElementId == firstFee.ElementId)
                    : null;
                return new ServiceVariantElementFeeGroupDto(
                    g.Key.ServiceVariantId,
                    g.Key.ServiceId,
                    g.Key.ServiceName,
                    g.Key.VariantType,
                    g.Sum(x => x.Amount),
                    g.ToList(),
                    ef?.FormulaExpression,
                    ef?.ApplyLateRenewalSurcharge
                );
            })
            .ToList();

        int totalCount = groups.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginatedGroups = groups.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new PaginatedApiResponse<ServiceVariantElementFeeGroupDto>(paginatedGroups, pageNumber, pageSize, totalCount);
    }
}
