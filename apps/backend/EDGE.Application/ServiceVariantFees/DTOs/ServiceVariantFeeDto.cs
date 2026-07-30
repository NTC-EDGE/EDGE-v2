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
    DateTime CreatedAt
);
