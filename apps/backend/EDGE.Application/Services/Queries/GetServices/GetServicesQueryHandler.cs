using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServices;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, PaginatedApiResponse<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServicesQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<PaginatedApiResponse<ServiceDto>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await _serviceRepository.GetServicesAsync(
            request.ServiceCategoryId,
            request.TenantId,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            services = services.Where(s => 
                s.Name.ToLower().Contains(search) || 
                (s.Code != null && s.Code.ToLower().Contains(search)) || 
                (s.Description != null && s.Description.ToLower().Contains(search))
            ).ToList();
        }

        int totalCount = services.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = services.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var dtos = paginated.Select(s => new ServiceDto
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

        return new PaginatedApiResponse<ServiceDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
