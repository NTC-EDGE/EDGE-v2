using System;

namespace EDGE.Application.ServiceVariantFees.DTOs;

public record ServiceVariantFeeDto(
    Guid Id,
    Guid ServiceVariantId,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    DateTime CreatedAt
);
