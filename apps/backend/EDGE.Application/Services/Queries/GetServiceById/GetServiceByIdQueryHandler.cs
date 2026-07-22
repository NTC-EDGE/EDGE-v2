using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Services.Dtos;

namespace EDGE.Application.Services.Queries.GetServiceById;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ApiResponse<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServiceByIdQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<ServiceDto>> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service == null)
        {
            return ApiResponse<ServiceDto>.Fail($"Service with ID {request.Id} was not found.");
        }

        var dto = new ServiceDto
        {
            Id = service.Id,
            ServiceCategoryId = service.ServiceCategoryId,
            ServiceCategoryCode = service.ServiceCategory?.Code ?? string.Empty,
            ServiceCategoryType = service.ServiceCategory?.Type.ToString() ?? string.Empty,
            Name = service.Name,
            Group = service.Group,
            Code = service.Code,
            Description = service.Description,
            TenantId = service.TenantId
        };

        return ApiResponse<ServiceDto>.Success(dto);
    }
}
