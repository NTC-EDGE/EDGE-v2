namespace EDGE.Application.Fees.DTOs;

public record FeeDto(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAt
);
