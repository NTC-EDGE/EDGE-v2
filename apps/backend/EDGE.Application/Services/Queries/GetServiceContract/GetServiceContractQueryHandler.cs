using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Services.Queries.GetServiceContract;

public class GetServiceContractQueryHandler : IRequestHandler<GetServiceContractQuery, ApiResponse<object>>
{
    private readonly IServiceRepository _serviceRepository;

    public GetServiceContractQueryHandler(IServiceRepository serviceRepository)
    {
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<object>> Handle(GetServiceContractQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<object>.Fail($"Service with ID {request.ServiceId} was not found.");
        }

        if (string.IsNullOrWhiteSpace(service.Contract))
        {
            return ApiResponse<object>.Fail($"Service '{service.Name}' has no contract defined.");
        }

        // Deserialize the raw JSON column into a structured object so the response
        // is a proper JSON object, not a double-encoded string.
        using var doc = JsonDocument.Parse(service.Contract);
        var contractObject = JsonSerializer.Deserialize<object>(service.Contract);

        if (contractObject == null)
        {
            return ApiResponse<object>.Fail("Service contract could not be parsed.");
        }

        return ApiResponse<object>.Success(contractObject);
    }
}
