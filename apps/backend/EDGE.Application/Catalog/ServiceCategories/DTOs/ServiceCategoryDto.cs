using EDGE.Domain.Enums;

namespace EDGE.Application.Catalog.ServiceCategories.DTOs;

public record ServiceCategoryDto(
    Guid Id,
    ServiceCategoryType Type,
    string Name,
    string? Code,
    DateTime CreatedAt
);
