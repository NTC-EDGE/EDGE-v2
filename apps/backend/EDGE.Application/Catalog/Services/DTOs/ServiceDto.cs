using EDGE.Domain.Enums;

namespace EDGE.Application.Catalog.Services.DTOs;

public record ServiceDto(
    Guid Id,
    Guid ServiceCategoryId,
    string ServiceCategoryName,
    ServiceCategoryType ServiceCategoryType,
    Guid TenantId,
    string Name,
    string? Group,
    string? Code,
    string? Description,
    ContractDto Contract,
    DateTime CreatedAt
);
