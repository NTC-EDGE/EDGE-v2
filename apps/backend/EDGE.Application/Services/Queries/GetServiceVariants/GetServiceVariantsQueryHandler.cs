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

    public GetServiceVariantsQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<List<ServiceVariantDto>>> Handle(GetServiceVariantsQuery request, CancellationToken cancellationToken)
    {
        // Returns empty list (not 404) when service has no variants — per plan §3.2
        var variants = await _serviceRepository.GetVariantsByServiceIdAsync(request.ServiceId, cancellationToken);

        var dtos = variants.Select(v => new ServiceVariantDto
        {
            Id = v.Id,
            Type = v.Type.ToString(),
            Description = v.Description
        }).ToList();

        return ApiResponse<List<ServiceVariantDto>>.Success(dtos);
    }
}
