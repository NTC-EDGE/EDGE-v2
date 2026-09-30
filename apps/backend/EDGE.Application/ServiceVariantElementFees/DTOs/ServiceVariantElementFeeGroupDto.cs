using System;
using System.Collections.Generic;

namespace EDGE.Application.ServiceVariantElementFees.DTOs;

public record ServiceVariantElementFeeGroupDto(
    Guid ServiceVariantId,
    Guid? ServiceId,
    string? ServiceName,
    string? VariantType,
    decimal TotalBaseAmount,
    IReadOnlyList<ServiceVariantElementFeeDto> ElementFees,
    string? StatutoryFormula = null,
    bool? ApplyLateRenewalSurcharge = null
);
