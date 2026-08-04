using System;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.DTOs;

public record ServiceVariantElementFeeDto(
    Guid Id,
    Guid ServiceVariantId,
    ServiceVariantDetailDto? ServiceVariant,
    Guid ElementId,
    string? ElementCode,
    string? ElementName,
    Guid FeeId,
    string? FeeCode,
    string? FeeName,
    decimal Amount,
    DateTime CreatedAt
);
