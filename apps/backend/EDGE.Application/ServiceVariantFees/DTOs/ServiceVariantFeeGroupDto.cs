using System;
using System.Collections.Generic;

namespace EDGE.Application.ServiceVariantFees.DTOs;

public record ServiceVariantFeeGroupDto(
    Guid ServiceVariantId,
    Guid? ServiceId,
    string? ServiceName,
    string? VariantType,
    decimal TotalBaseAmount,
    IReadOnlyList<ServiceVariantFeeDto> Fees,
    string? StatutoryFormula = null,
    bool? ApplyLateRenewalSurcharge = null,
    string? VariantName = null,
    string? ApplicationType = null
);
