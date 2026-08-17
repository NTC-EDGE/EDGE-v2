using System;
using MediatR;
using EDGE.Domain.Entities;

namespace EDGE.Application.Roles.Commands;

public record DuplicateRoleCommand(
    Guid SourceRoleId,
    string Name,
    string Key,
    string? Description,
    Guid TargetTenantId
) : IRequest<Role>;
