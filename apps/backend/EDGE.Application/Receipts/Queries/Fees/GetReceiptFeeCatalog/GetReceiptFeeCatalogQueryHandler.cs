using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Receipts.Dtos;

namespace EDGE.Application.Receipts.Queries.Fees.GetReceiptFeeCatalog;

public record GetReceiptFeeCatalogQuery(string? Search = null) : IRequest<ApiResponse<List<ReceiptFeeItemDto>>>;

public class GetReceiptFeeCatalogQueryHandler : IRequestHandler<GetReceiptFeeCatalogQuery, ApiResponse<List<ReceiptFeeItemDto>>>
{
    private readonly IServiceFeeRepository _serviceFeeRepository;
    private readonly IServiceVariantFeeRepository _serviceVariantFeeRepository;
    private readonly IServiceVariantElementFeeRepository _serviceVariantElementFeeRepository;
    private readonly IFeeRepository _feeRepository;

    public GetReceiptFeeCatalogQueryHandler(
        IServiceFeeRepository serviceFeeRepository,
        IServiceVariantFeeRepository serviceVariantFeeRepository,
        IServiceVariantElementFeeRepository serviceVariantElementFeeRepository,
        IFeeRepository feeRepository)
    {
        _serviceFeeRepository = serviceFeeRepository;
        _serviceVariantFeeRepository = serviceVariantFeeRepository;
        _serviceVariantElementFeeRepository = serviceVariantElementFeeRepository;
        _feeRepository = feeRepository;
    }

    public async Task<ApiResponse<List<ReceiptFeeItemDto>>> Handle(GetReceiptFeeCatalogQuery request, CancellationToken cancellationToken)
    {
        var items = new List<ReceiptFeeItemDto>();

        // 1. Service Fees
        var serviceFees = await _serviceFeeRepository.GetAllAsync(null, null, true, cancellationToken);
        foreach (var sf in serviceFees)
        {
            var code = sf.Fee?.Code ?? "FEE";
            var name = sf.Fee?.Name ?? "Service Fee";
            var desc = sf.Service != null ? $"{name} - {sf.Service.Name}" : name;
            items.Add(new ReceiptFeeItemDto(
                sf.Id,
                code,
                name,
                desc,
                sf.Amount,
                "Service Fee",
                sf.Service?.Name,
                null,
                null
            ));
        }

        // 2. Service Variant Fees
        var variantFees = await _serviceVariantFeeRepository.GetAllAsync(cancellationToken);
        foreach (var svf in variantFees)
        {
            var code = svf.Fee?.Code ?? "FEE";
            var name = svf.Fee?.Name ?? "Variant Fee";
            var variantName = svf.ServiceVariant != null ? $"{svf.ServiceVariant.Type}" : "Variant";
            var serviceName = svf.ServiceVariant?.Service?.Name;
            var desc = $"{name} - {variantName}" + (!string.IsNullOrWhiteSpace(serviceName) ? $" ({serviceName})" : "");
            items.Add(new ReceiptFeeItemDto(
                svf.Id,
                code,
                name,
                desc,
                svf.Amount,
                "Service Variant Fee",
                serviceName,
                variantName,
                null
            ));
        }

        // 3. Service Variant Element Fees
        var elementFees = await _serviceVariantElementFeeRepository.GetAllAsync(cancellationToken);
        foreach (var svef in elementFees)
        {
            var code = svef.Fee?.Code ?? "FEE";
            var name = svef.Fee?.Name ?? "Element Fee";
            var elemName = svef.Element?.Name ?? "Element";
            var variantName = svef.ServiceVariant != null ? $"{svef.ServiceVariant.Type}" : null;
            var serviceName = svef.ServiceVariant?.Service?.Name;
            var desc = $"{name} ({elemName})" + (!string.IsNullOrWhiteSpace(variantName) ? $" - {variantName}" : "");
            items.Add(new ReceiptFeeItemDto(
                svef.Id,
                code,
                name,
                desc,
                svef.Amount,
                "Service Variant Element Fee",
                serviceName,
                variantName,
                elemName
            ));
        }

        // 4. Master Fees
        var masterFees = await _feeRepository.GetAllAsync(true, cancellationToken);
        foreach (var f in masterFees)
        {
            if (!items.Any(i => i.FeeCode.Equals(f.Code, StringComparison.OrdinalIgnoreCase)))
            {
                items.Add(new ReceiptFeeItemDto(
                    f.Id,
                    f.Code,
                    f.Name,
                    f.Description ?? f.Name,
                    0m,
                    "Master Fee",
                    null,
                    null,
                    null
                ));
            }
        }

        // Apply Search Filter if provided
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            items = items.Where(i =>
                i.FeeCode.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                i.Name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                i.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                (i.ServiceName != null && i.ServiceName.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (i.VariantName != null && i.VariantName.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                (i.ElementName != null && i.ElementName.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                i.SourceType.Contains(search, StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        var sortedItems = items
            .OrderBy(i => i.FeeCode)
            .ThenBy(i => i.Name)
            .ToList();

        return ApiResponse<List<ReceiptFeeItemDto>>.Success(sortedItems);
    }
}
