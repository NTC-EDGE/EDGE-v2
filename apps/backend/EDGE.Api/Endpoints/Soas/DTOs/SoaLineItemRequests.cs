using System;

namespace EDGE.Api.Endpoints.Soas.DTOs;

public record AddSoaLineItemRequest(
    string Particular,
    string ItemCode,
    string? Description,
    DateTime? PeriodOfCoverageStart,
    DateTime? PeriodOfCoverageEnd,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate
);

public record UpdateSoaLineItemRequest(
    string Particular,
    string ItemCode,
    string? Description,
    DateTime? PeriodOfCoverageStart,
    DateTime? PeriodOfCoverageEnd,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate,
    decimal? Amount
);

public record UpdateSoaRequest(
    DateTime? DueDate,
    string? IssuedToName,
    string? IssuedToAddress,
    string? Remarks
);
