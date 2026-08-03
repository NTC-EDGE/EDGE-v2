using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceVariants;

public class GetServiceVariantsQueryHandler : IRequestHandler<GetServiceVariantsQuery, ApiResponse<List<ServiceVariantDto>>>
{
    private readonly IServiceRepository _serviceRepository;
    private readonly IServiceVariantRepository _variantRepository;

    public GetServiceVariantsQueryHandler(IServiceRepository serviceRepository, IServiceVariantRepository variantRepository)
    {
        _serviceRepository = serviceRepository;
        _variantRepository = variantRepository;
    }

    public async Task<ApiResponse<List<ServiceVariantDto>>> Handle(GetServiceVariantsQuery request, CancellationToken cancellationToken)
    {
        var variants = request.ServiceId.HasValue
            ? await _variantRepository.GetByServiceIdAsync(request.ServiceId.Value, cancellationToken)
            : await _variantRepository.GetAllAsync(cancellationToken);

        var dtos = variants.Select(v => new ServiceVariantDto
        {
            Id = v.Id,
            ServiceId = v.ServiceId,
            ServiceName = v.Service?.Name,
            Type = v.Type.ToString(),
            Description = v.Description
        }).ToList();

        return ApiResponse<List<ServiceVariantDto>>.Success(dtos);
    }
}
