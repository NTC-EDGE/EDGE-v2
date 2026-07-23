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
    Guid? VariantId,
    string? ExamineeType
) : IRequest<ApiResponse<List<ServiceRequirementItemDto>>>;

public class GetServiceRequirementsQueryHandler : IRequestHandler<GetServiceRequirementsQuery, ApiResponse<List<ServiceRequirementItemDto>>>
{
    private readonly IRequirementRepository _repository;

    public GetServiceRequirementsQueryHandler(IRequirementRepository repository)
    {
        _repository = repository;
    }

    public async Task<ApiResponse<List<ServiceRequirementItemDto>>> Handle(GetServiceRequirementsQuery request, CancellationToken cancellationToken)
    {
        var rules = await _repository.GetServiceVariantRequirementsAsync(request.ServiceId, request.VariantId, request.ExamineeType, cancellationToken);

        var result = rules.Select(svr => new ServiceRequirementItemDto
        {
            RequirementId = svr.RequirementId,
            ServiceVariantRequirementId = svr.Id,
            Name = svr.Requirement?.Name ?? string.Empty,
            Description = svr.Requirement?.Description,
            ApplicationTypeKey = svr.ApplicationTypeKey,
            IsRequired = svr.IsRequired
        }).ToList();

        return ApiResponse<List<ServiceRequirementItemDto>>.Success(result, "Service requirements retrieved successfully.");
    }
}
