using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;

namespace EDGE.Application.Requirements.Queries.GetServiceRequirements;

public record GetServiceRequirementsQuery(
    Guid ServiceId,
    Guid? VariantId
) : IRequest<ApiResponse<List<ServiceRequirementItemDto>>>;

public class GetServiceRequirementsQueryHandler : IRequestHandler<GetServiceRequirementsQuery, ApiResponse<List<ServiceRequirementItemDto>>>
{
    private readonly IRequirementRepository _repository;
    private readonly IServiceRepository _serviceRepository;

    public GetServiceRequirementsQueryHandler(IRequirementRepository repository, IServiceRepository serviceRepository)
    {
        _repository = repository;
        _serviceRepository = serviceRepository;
    }

    public async Task<ApiResponse<List<ServiceRequirementItemDto>>> Handle(GetServiceRequirementsQuery request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            return ApiResponse<List<ServiceRequirementItemDto>>.Fail("Service not found.");
        }

        if (request.VariantId.HasValue)
        {
            var variant = await _serviceRepository.GetVariantByIdAsync(request.VariantId.Value, cancellationToken);
            if (variant == null)
            {
                return ApiResponse<List<ServiceRequirementItemDto>>.Fail("Service variant not found.");
            }
            if (variant.ServiceId != request.ServiceId)
            {
                return ApiResponse<List<ServiceRequirementItemDto>>.Fail("Service variant does not belong to the specified service.");
            }
        }

        var rules = await _repository.GetServiceVariantRequirementsAsync(request.ServiceId, request.VariantId, cancellationToken);

        var result = rules
            .GroupBy(svr => svr.RequirementId)
            .Select(g => g.OrderByDescending(x => x.IsRequired).First())
            .OrderBy(svr => svr.CreatedAt)
            .Select(svr => new ServiceRequirementItemDto
            {
                RequirementId = svr.RequirementId,
                ServiceVariantRequirementId = svr.Id,
                Name = svr.Requirement?.Name ?? string.Empty,
                Description = svr.Requirement?.Description,
                IsRequired = svr.IsRequired
            }).ToList();

        return ApiResponse<List<ServiceRequirementItemDto>>.Success(result, "Service requirements retrieved successfully.");
    }
}
