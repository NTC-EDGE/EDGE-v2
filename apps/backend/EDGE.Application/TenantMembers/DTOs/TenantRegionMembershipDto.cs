using System;

namespace EDGE.Application.TenantMembers.DTOs;

public record TenantRegionMembershipDto(
    Guid TenantId,
    string TenantName,
    Guid RegionId,
    string RegionCode,
    string RegionName
);
