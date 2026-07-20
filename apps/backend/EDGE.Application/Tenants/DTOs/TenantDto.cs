namespace EDGE.Application.Tenants.DTOs;

public record TenantDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);
