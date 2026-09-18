using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Commands.CreateSoa;

public record CreateSoaLineItemRequest(
    string Particular,
    string ItemCode,
    string? Description,
    DateTime? PeriodOfCoverageStart,
    DateTime? PeriodOfCoverageEnd,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate,
    decimal Amount
);

public record CreateSoaCommand(
    Guid ApplicationId,
    Guid? ApplicantId,
    string IssuedToType,
    string IssuedToName,
    string? IssuedToAddress,
    DateTime DueDate,
    List<CreateSoaLineItemRequest>? LineItems = null,
    int? ValidityYears = null,
    int? NoOfUnits = null,
    DateTime? ExpirationDate = null,
    int? AdditionalServicesCount = null,
    int? NoOfCopies = null
) : IRequest<ApiResponse<Guid>>;
