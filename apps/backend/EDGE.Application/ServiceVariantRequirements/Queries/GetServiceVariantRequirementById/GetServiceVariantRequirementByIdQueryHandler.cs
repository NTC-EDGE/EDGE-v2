using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Requirements.Dtos;
using EDGE.Application.ServiceVariantRequirements.Dtos;

namespace EDGE.Application.ServiceVariantRequirements.Queries.GetServiceVariantRequirementById;

public class GetServiceVariantRequirementByIdQueryHandler(IServiceVariantRequirementRepository repository)
    : IRequestHandler<GetServiceVariantRequirementByIdQuery, ApiResponse<ServiceVariantRequirementDto>>
{
    public async Task<ApiResponse<ServiceVariantRequirementDto>> Handle(GetServiceVariantRequirementByIdQuery request, CancellationToken cancellationToken)
    {
        var svr = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (svr == null)
        {
            return ApiResponse<ServiceVariantRequirementDto>.Fail($"Service Variant Requirement with ID '{request.Id}' was not found.");
        }

        var dto = new ServiceVariantRequirementDto
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
        };

        return ApiResponse<ServiceVariantRequirementDto>.Success(dto);
    }
}
