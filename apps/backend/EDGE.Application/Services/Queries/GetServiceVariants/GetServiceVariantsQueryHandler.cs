using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceVariants;

public class GetServiceVariantsQueryHandler : IRequestHandler<GetServiceVariantsQuery, PaginatedApiResponse<ServiceVariantDto>>
{
    private readonly IServiceVariantRepository _variantRepository;

    public GetServiceVariantsQueryHandler(IServiceVariantRepository variantRepository)
    {
        _variantRepository = variantRepository;
    }

    public GetServiceVariantsQueryHandler(IServiceRepository serviceRepository, IServiceVariantRepository variantRepository)
        : this(variantRepository)
    {
    }

    public async Task<PaginatedApiResponse<ServiceVariantDto>> Handle(GetServiceVariantsQuery request, CancellationToken cancellationToken)
    {
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var (items, totalCount) = await _variantRepository.GetPagedAsync(
            request.ServiceId,
            request.CategoryId,
            request.SearchTerm,
            pageNumber,
            pageSize,
            cancellationToken);

        var dtos = items.Select(v => new ServiceVariantDto
        {
            Id = v.Id,
            ServiceId = v.ServiceId,
            ServiceName = v.Service?.Name,
            Type = v.Type.ToString(),
            Description = v.Description,
            IsIndividual = v.IsIndividual
        }).ToList();

        return new PaginatedApiResponse<ServiceVariantDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
