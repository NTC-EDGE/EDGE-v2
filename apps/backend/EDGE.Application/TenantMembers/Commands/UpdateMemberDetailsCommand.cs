using MediatR;
using EDGE.Application.TenantMembers.DTOs;

namespace EDGE.Application.TenantMembers.Commands;

public record UpdateMemberDetailsCommand(
    Guid MemberId,
    Guid TenantId,
    string JobTitle,
    string ContactNumber,
    string? Department,
    bool IsAdmin,
    bool IsActive
) : IRequest<TenantMemberDto>;
