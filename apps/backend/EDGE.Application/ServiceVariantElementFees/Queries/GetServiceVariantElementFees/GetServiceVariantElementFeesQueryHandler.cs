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

        if (request.ServiceId.HasValue)
        {
            fees = fees.Where(svef => svef.ServiceVariant != null && svef.ServiceVariant.ServiceId == request.ServiceId.Value).ToList();
        }

        if (request.ElementId.HasValue)
        {
            fees = fees.Where(svef => svef.ElementId == request.ElementId.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.ApplicationType))
        {
            fees = fees.Where(svef => svef.ServiceVariant != null && svef.ServiceVariant.Type.ToString().Equals(request.ApplicationType.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            fees = fees.Where(svef => 
                (svef.ServiceVariant?.Service != null && svef.ServiceVariant.Service.Name.ToLower().Contains(search)) || 
                (svef.ServiceVariant?.Service != null && svef.ServiceVariant.Service.Code != null && svef.ServiceVariant.Service.Code.ToLower().Contains(search)) || 
                (svef.ServiceVariant != null && svef.ServiceVariant.Type.ToString().ToLower().Contains(search)) || 
                (svef.ServiceVariant != null && svef.ServiceVariant.Description != null && svef.ServiceVariant.Description.ToLower().Contains(search)) || 
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
                svef.ServiceVariant.Type.ToString(),
                svef.ServiceVariant.Description ?? svef.ServiceVariant.Type.ToString(),
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
                VariantName = svef.ServiceVariant?.VariantName ?? svef.ServiceVariant?.Type,
                VariantType = svef.ServiceVariant?.Type
            })
            .Select(g => {
                var firstFee = g.FirstOrDefault();
                var ef = firstFee != null
                    ? elementFormulas.FirstOrDefault(f => f.ServiceVariantId == g.Key.ServiceVariantId && f.ElementId == firstFee.ElementId)
                    : null;
                var elementTotal = g.GroupBy(x => x.ElementId)
                    .Select(eg => eg.Sum(x => x.Amount))
                    .FirstOrDefault();

                return new ServiceVariantElementFeeGroupDto(
                    g.Key.ServiceVariantId,
                    g.Key.ServiceId,
                    g.Key.ServiceName,
                    g.Key.VariantType,
                    elementTotal,
                    g.ToList(),
                    ef?.FormulaExpression,
                    ef?.ApplyLateRenewalSurcharge,
                    g.Key.VariantName,
                    g.Key.VariantType
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
