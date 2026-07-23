using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Requirements.Commands.AttachServiceVariantRequirement;

public record AttachServiceVariantRequirementCommand(
    Guid RequirementId,
    string? ApplicationTypeKey,
    bool IsRequired = true,
    Guid ServiceId = default,
    Guid ServiceVariantId = default
) : IRequest<ApiResponse<Guid>>;
