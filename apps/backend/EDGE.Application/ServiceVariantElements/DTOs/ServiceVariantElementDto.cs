namespace EDGE.Application.ServiceVariantElements.DTOs;

public record ServiceVariantElementDto(
    Guid Id,
    Guid ServiceVariantId,
    string? ServiceVariantDescription,
    string Code,
    string Description,
    DateTime CreatedAt
);
