using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServices;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, ApiResponse<List<ServiceDto>>>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServicesQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<List<ServiceDto>>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetServicesAsync(
            request.ServiceCategoryId,
            request.TenantId,
            cancellationToken);

        var dtos = services.Select(s => new ServiceDto
        {
            Id = s.Id,
            ServiceCategoryId = s.ServiceCategoryId,
            ServiceCategoryCode = s.ServiceCategory?.Code ?? string.Empty,
            ServiceCategoryType = s.ServiceCategory?.Type.ToString() ?? string.Empty,
            Name = s.Name,
            Group = s.Group,
            Code = s.Code,
            Description = s.Description,
            TenantId = s.TenantId
        }).ToList();

        return ApiResponse<List<ServiceDto>>.Success(dtos);
    }
}
