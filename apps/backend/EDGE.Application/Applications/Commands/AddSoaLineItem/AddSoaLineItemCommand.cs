using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.AddSoaLineItem;

public record AddSoaLineItemCommand(
    Guid SoaId,
    string Particular,
    string ItemCode,
    string? Description,
    DateTime? PeriodOfCoverageStart,
    DateTime? PeriodOfCoverageEnd,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate
) : IRequest<ApiResponse<Guid>>;
