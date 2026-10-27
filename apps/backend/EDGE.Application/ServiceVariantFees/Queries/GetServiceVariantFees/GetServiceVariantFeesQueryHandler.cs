using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;

public class GetServiceVariantFeesQueryHandler : IRequestHandler<GetServiceVariantFeesQuery, PaginatedApiResponse<ServiceVariantFeeGroupDto>>
{
    private readonly IServiceVariantFeeRepository _repository;
    private readonly IServiceVariantFormulaRepository _formulaRepository;

    public GetServiceVariantFeesQueryHandler(
        IServiceVariantFeeRepository repository,
        IServiceVariantFormulaRepository formulaRepository)
    {
        _repository = repository;
        _formulaRepository = formulaRepository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantFeeGroupDto>> Handle(GetServiceVariantFeesQuery request, CancellationToken cancellationToken)
    {
        var fees = request.ServiceVariantId.HasValue
            ? await _repository.GetByServiceVariantIdAsync(request.ServiceVariantId.Value, cancellationToken)
            : await _repository.GetAllAsync(cancellationToken);

        var formulas = await _formulaRepository.GetAllAsync(cancellationToken);
        var formulaDict = formulas.ToDictionary(f => f.ServiceVariantId);

        if (request.ServiceId.HasValue)
        {
            fees = fees.Where(svf => svf.ServiceVariant != null && svf.ServiceVariant.ServiceId == request.ServiceId.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.ApplicationType))
        {
            fees = fees.Where(svf => svf.ServiceVariant != null && svf.ServiceVariant.Type.ToString().Equals(request.ApplicationType.Trim(), StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            fees = fees.Where(svf => 
                (svf.ServiceVariant?.Service != null && svf.ServiceVariant.Service.Name.ToLower().Contains(search)) || 
                (svf.ServiceVariant?.Service != null && svf.ServiceVariant.Service.Code != null && svf.ServiceVariant.Service.Code.ToLower().Contains(search)) || 
                (svf.ServiceVariant != null && svf.ServiceVariant.Type.ToString().ToLower().Contains(search)) || 
                (svf.ServiceVariant != null && svf.ServiceVariant.Description != null && svf.ServiceVariant.Description.ToLower().Contains(search)) || 
                (svf.Fee != null && svf.Fee.Code.ToLower().Contains(search)) || 
                (svf.Fee != null && svf.Fee.Name.ToLower().Contains(search))
            ).ToList();
        }

        var allDtos = fees.Select(svf => new ServiceVariantFeeDto(
            svf.Id,
            svf.ServiceVariantId,
            svf.ServiceVariant != null ? new ServiceVariantDetailDto(
                svf.ServiceVariant.Id,
                svf.ServiceVariant.ServiceId,
                svf.ServiceVariant.Service?.Name,
                svf.ServiceVariant.Type.ToString(),
                svf.ServiceVariant.Description ?? svf.ServiceVariant.Type.ToString(),
                svf.ServiceVariant.Type.ToString()
            ) : null,
            svf.FeeId,
            svf.Fee?.Code,
            svf.Fee?.Name,
            svf.Amount,
            svf.IsActive,
            svf.CreatedAt
        )).ToList();

        var groups = allDtos
            .GroupBy(svf => new {
                svf.ServiceVariantId,
                ServiceId = svf.ServiceVariant?.ServiceId,
                ServiceName = svf.ServiceVariant?.ServiceName,
                VariantName = svf.ServiceVariant?.VariantName ?? svf.ServiceVariant?.Type,
                VariantType = svf.ServiceVariant?.Type
            })
            .Select(g => {
                formulaDict.TryGetValue(g.Key.ServiceVariantId, out var f);
                return new ServiceVariantFeeGroupDto(
                    g.Key.ServiceVariantId,
                    g.Key.ServiceId,
                    g.Key.ServiceName,
                    g.Key.VariantType,
                    g.Sum(x => x.Amount),
                    g.ToList(),
                    f?.FormulaExpression,
                    f?.ApplyLateRenewalSurcharge,
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

        return new PaginatedApiResponse<ServiceVariantFeeGroupDto>(paginatedGroups, pageNumber, pageSize, totalCount);
    }
}
