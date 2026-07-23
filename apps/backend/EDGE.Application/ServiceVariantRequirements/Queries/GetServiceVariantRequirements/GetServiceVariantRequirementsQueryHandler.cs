using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;
using EDGE.Application.ServiceVariantRequirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirements;

public class GetServiceVariantRequirementsQueryHandler(IServiceVariantRequirementRepository repository)
    : IRequestHandler<GetServiceVariantRequirementsQuery, ApiResponse<List<ServiceVariantRequirementDto>>>
{
    public async Task<ApiResponse<List<ServiceVariantRequirementDto>>> Handle(GetServiceVariantRequirementsQuery request, CancellationToken cancellationToken)
    {
        var list = await repository.GetByServiceVariantIdAsync(request.ServiceVariantId, cancellationToken);

        var dtos = list.Select(svr => new ServiceVariantRequirementDto
        {
            Id = svr.Id,
            RequirementId = svr.RequirementId,
            Requirement = svr.Requirement != null ? new RequirementDto
            {
                Id = svr.Requirement.Id,
                Name = svr.Requirement.Name,
                Description = svr.Requirement.Description
            } : null,
            ServiceVariantId = svr.ServiceVariantId,
            ApplicationTypeKey = svr.ApplicationTypeKey,
            IsRequired = svr.IsRequired
        }).ToList();

        return ApiResponse<List<ServiceVariantRequirementDto>>.Success(dtos);
    }
}
