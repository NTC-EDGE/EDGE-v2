using System.Collections.Generic;
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
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceVariantRepository _variantRepository;

    public GetServiceVariantsQueryHandler(IServiceRepository serviceRepository, IServiceVariantRepository variantRepository)
    {
        _serviceRepository = serviceRepository;
        _variantRepository = variantRepository;
    }

    public async Task<PaginatedApiResponse<ServiceVariantDto>> Handle(GetServiceVariantsQuery request, CancellationToken cancellationToken)
    {
        var variants = await _variantRepository.GetAllAsync(cancellationToken);

        if (request.ServiceId.HasValue)
        {
            variants = variants.Where(v => v.ServiceId == request.ServiceId.Value).ToList();
        }
        else if (request.CategoryId.HasValue)
        {
            variants = variants.Where(v => v.Service != null && v.Service.ServiceCategoryId == request.CategoryId.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            variants = variants.Where(v =>
                v.Type.ToString().ToLower().Contains(search) ||
                (v.Description != null && v.Description.ToLower().Contains(search)) ||
                (v.Service != null && v.Service.Name.ToLower().Contains(search)) ||
                (v.IsIndividual ? "individual" : "company").Contains(search)
            ).ToList();
        }

        variants = variants
            .OrderBy(v => v.Service != null ? v.Service.Name : string.Empty)
            .ThenBy(v => v.Type.ToString())
            .ThenBy(v => v.Description ?? string.Empty)
            .ToList();

        int totalCount = variants.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = variants.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(v => new ServiceVariantDto
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
