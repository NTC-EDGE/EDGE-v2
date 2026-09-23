using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public record AssignUserToTenantCommand(
    Guid TenantId,
    Guid UserId,
    Guid RoleId,
    string? JobTitle,
    string? Level,
    string Division,
    string Position,
    string? Designation,
    Guid? FieldOfficeId = null
) : IRequest<TenantMemberDto>;
