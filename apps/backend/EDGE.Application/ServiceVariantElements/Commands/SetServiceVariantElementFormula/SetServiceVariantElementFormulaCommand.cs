using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.ServiceVariantElements.Commands.SetServiceVariantElementFormula;

public record SetServiceVariantElementFormulaCommand(
    Guid ServiceVariantId,
    Guid ElementId,
    string FormulaExpression,
    string? Description,
    bool ApplyLateRenewalSurcharge
) : IRequest<ApiResponse<bool>>;
