using System;

namespace EDGE.Application.Tenants.DTOs;

public record TenantClientDto(
    Guid Id,
    Guid? UserId,
    string Name,
    string Email,
    string Organization,
    string LicenseCategory,
    string Status,
    int ApplicationCount,
    DateTime? RegisteredDate
);
