using System;
using System.Collections.Generic;

namespace EDGE.Application.Auth.Commands.VerifyStaffSession;

public record VerifyStaffSessionDto(
    Guid UserId,
    string Email,
    Guid TenantId,
    string TenantName,
    string RegionCode,
    string RegionName,
    bool IsAuthorized,
    List<string> AssignedRoles,
    List<string> EffectivePermissions
);
