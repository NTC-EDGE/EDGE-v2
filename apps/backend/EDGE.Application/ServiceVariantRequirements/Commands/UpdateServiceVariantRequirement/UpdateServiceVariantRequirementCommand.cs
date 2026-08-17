using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;

public record UpdateServiceVariantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public Guid? TenantId { get; init; }
    public Guid? RequirementId { get; init; }
    public Guid? ServiceVariantId { get; init; }
    public bool IsRequired { get; init; }
}
