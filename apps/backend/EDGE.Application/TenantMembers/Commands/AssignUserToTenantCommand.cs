using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public record AssignUserToTenantCommand(
    Guid TenantId,
    Guid UserId,
    string JobTitle,
    string ContactNumber,
    string? Department,
    bool IsAdmin
) : IRequest<TenantMemberDto>;
