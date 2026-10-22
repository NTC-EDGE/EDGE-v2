using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantRequirements.Commands.CreateServiceVariantRequirement;

public record CreateServiceVariantRequirementCommand : IRequest<ApiResponse<List<Guid>>>
{
    public Guid? TenantId { get; init; }
    public required Guid ServiceVariantId { get; init; }
    public required List<ServiceVariantRequirementItem> Requirements { get; init; } = [];
}

public record ServiceVariantRequirementItem
{
    public Guid? TenantId { get; init; }
    public required Guid RequirementId { get; init; }
    public bool IsRequired { get; init; }
}
