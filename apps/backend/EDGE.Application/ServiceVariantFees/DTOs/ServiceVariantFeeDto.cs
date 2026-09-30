using System;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceVariantFees.DTOs;

public record ServiceVariantFeeDto(
    Guid Id,
    Guid ServiceVariantId,
    ServiceVariantDetailDto? ServiceVariant,
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
