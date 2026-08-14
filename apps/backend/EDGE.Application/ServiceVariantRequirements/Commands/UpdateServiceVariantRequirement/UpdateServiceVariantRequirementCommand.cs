using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.UpdateServiceVariantRequirement;

public record UpdateServiceVariantRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid Id { get; init; }
    public Guid? TenantId { get; init; }
    public required Guid RequirementId { get; init; }
    public required Guid ServiceVariantId { get; init; }
    public bool IsRequired { get; init; }
}
