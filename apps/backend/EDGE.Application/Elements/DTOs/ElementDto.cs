using System;

namespace EDGE.Application.Elements.DTOs;

public record ElementDto(
    Guid Id,
    string Name,
    string Code,
    string? Description,
    DateTime CreatedAt
);
