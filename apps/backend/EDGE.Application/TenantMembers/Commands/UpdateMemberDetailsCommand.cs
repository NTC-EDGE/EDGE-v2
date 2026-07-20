using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public record UpdateMemberDetailsCommand(
    Guid MemberId,
    Guid TenantId,
    Guid RoleId,
    string? JobTitle,
    string? Level,
    string Division,
    string Position,
    string? Designation
) : IRequest<TenantMemberDto>;
