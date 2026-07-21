using EDGE.Domain.Enums;

namespace EDGE.Application.Catalog.ServiceVariants.DTOs;

public record ServiceVariantDto(
    Guid Id,
    Guid ServiceId,
    ServiceVariantType Type,
    string? Description,
    DateTime CreatedAt
);
