using System;

namespace EDGE.Application.ServiceVariantElements.DTOs;

public record ServiceVariantElementFormulaDto(
    Guid Id,
    Guid ServiceVariantId,
    Guid ElementId,
    string? ElementCode,
    string? ElementName,
    string FormulaExpression,
    string? Description,
    bool ApplyLateRenewalSurcharge,
    bool IsActive
);
