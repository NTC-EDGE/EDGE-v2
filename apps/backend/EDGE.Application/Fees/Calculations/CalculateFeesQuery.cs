using System;
using MediatR;
using EDGE.Domain.Enums;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Fees.Calculations;

public record CalculateFeesQuery(
    string Activity,
    string ApplicationType,
    string? Element = null,
    int ValidityYears = 1,
    int NoOfUnits = 1,
    DateTime? ExpirationDate = null,
    int AdditionalServicesCount = 0,
    int NoOfCopies = 1,
    int NoOfChannels = 1,
    DateTime? AsOfDate = null,
    ServiceCategoryType? Category = null,
    Guid? ServiceVariantId = null,
    Guid? ElementId = null
) : IRequest<ApiResponse<FeeCalculationResultDto>>;
