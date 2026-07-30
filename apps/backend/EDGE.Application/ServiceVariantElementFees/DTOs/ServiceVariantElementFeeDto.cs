using System;

namespace EDGE.Application.ServiceVariantElementFees.DTOs;

public record ServiceVariantElementFeeDto(
    Guid Id,
    Guid ServiceVariantId,
    Guid ElementId,
    string? ElementCode,
    string? ElementName,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    DateTime CreatedAt
);
