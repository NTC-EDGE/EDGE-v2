using System;

namespace EDGE.Application.ServiceVariants.DTOs;

public record ServiceVariantFormulaDto(
    Guid Id,
    Guid ServiceVariantId,
    string FormulaExpression,
    string? Description,
    bool ApplyLateRenewalSurcharge,
    bool IsActive
);
