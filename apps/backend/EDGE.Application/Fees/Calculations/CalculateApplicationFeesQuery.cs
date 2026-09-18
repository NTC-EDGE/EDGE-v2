using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Fees.Calculations;

public record CalculateApplicationFeesQuery(
    Guid ApplicationId,
    Guid? ApplicantId = null,
    int? ValidityYears = null,
    int? NoOfUnits = null,
    DateTime? ExpirationDate = null,
    int? AdditionalServicesCount = null,
    int? NoOfCopies = null
) : IRequest<ApiResponse<FeeCalculationResultDto>>;
