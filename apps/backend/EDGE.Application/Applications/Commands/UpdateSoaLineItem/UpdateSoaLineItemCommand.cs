using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.UpdateSoaLineItem;

public record UpdateSoaLineItemCommand(
    Guid SoaId,
    Guid LineItemId,
    string Particular,
    string ItemCode,
    string? Description,
    DateTime? PeriodOfCoverageStart,
    DateTime? PeriodOfCoverageEnd,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate,
    decimal? Amount = null
) : IRequest<ApiResponse<Guid>>;
