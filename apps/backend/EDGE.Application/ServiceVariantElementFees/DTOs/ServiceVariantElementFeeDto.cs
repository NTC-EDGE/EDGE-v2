using System;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Domain.Enums;

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
    FeeCalculationMode CalculationMode,
    string? CalculationFormula,
    bool MultiplyByValidityYears,
    bool MultiplyByUnits,
    bool MultiplyByChannels,
    bool MultiplyByPages,
    bool ApplyLateRenewalSurcharge,
    bool IncludeDst,
    decimal DstAmount,
    DateTime CreatedAt
);
