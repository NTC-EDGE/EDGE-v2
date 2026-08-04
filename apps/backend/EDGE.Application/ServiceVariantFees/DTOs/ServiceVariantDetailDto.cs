using System;

namespace EDGE.Application.ServiceVariantFees.DTOs;

public record ServiceVariantDetailDto(
    Guid Id,
    Guid ServiceId,
    string? ServiceName,
    string? Type
);
