using System.Text.Json;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Catalog.Services.DTOs;

namespace EDGE.Application.Catalog.Services.Queries;

public record GetServicesQuery(Guid? CategoryId = null) : IRequest<List<ServiceDto>>;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, List<ServiceDto>>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServicesQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<List<ServiceDto>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = request.CategoryId.HasValue
            ? await _serviceRepository.GetByCategoryIdAsync(request.CategoryId.Value, cancellationToken)
            : await _serviceRepository.GetAllAsync(cancellationToken);

        return services.Select(MapToDto).ToList();
    }

    internal static ServiceDto MapToDto(Service service)
    {
        var contract = JsonSerializer.Deserialize<ContractDto>(service.Contract) ?? new ContractDto();
        return new ServiceDto(
            service.Id,
            service.ServiceCategoryId,
            service.ServiceCategory?.Name ?? string.Empty,
            service.ServiceCategory?.Type ?? default,
            service.TenantId,
            service.Name,
            service.Group,
            service.Code,
            service.Description,
            contract,
            service.CreatedAt
        );
    }
}

public record GetServiceByIdQuery(Guid Id) : IRequest<ServiceDto?>;

public class GetServiceByIdQueryHandler : IRequestHandler<GetServiceByIdQuery, ServiceDto?>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServiceByIdQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<ServiceDto?> Handle(GetServiceByIdQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.Id, cancellationToken);
        if (service is null)
        {
            return null;
        }

        return GetServicesQueryHandler.MapToDto(service);
    }
}
