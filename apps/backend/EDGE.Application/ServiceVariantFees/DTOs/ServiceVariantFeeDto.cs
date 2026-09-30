using System;

namespace EDGE.Application.ServiceVariantFees.DTOs;

public record ServiceVariantFeeDto(
    Guid Id,
    Guid ServiceVariantId,
    ServiceVariantDetailDto? ServiceVariant,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    bool IsActive,
    DateTime CreatedAt
);
