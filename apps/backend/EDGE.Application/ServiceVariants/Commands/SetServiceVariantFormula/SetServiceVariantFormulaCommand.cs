using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariants.Commands.SetServiceVariantFormula;

public record SetServiceVariantFormulaCommand(
    Guid ServiceVariantId,
    string FormulaExpression,
    string? Description,
    bool ApplyLateRenewalSurcharge
) : IRequest<ApiResponse<bool>>;
