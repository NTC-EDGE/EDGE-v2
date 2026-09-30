using System;
using System.Collections.Generic;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.Fees.Calculations;

public record CalculatedFeeLineItemDto(
    string Particular,
    string ItemCode,
    string? Description,
    int ValidityYears,
    int NoOfUnits,
    decimal FeeRate,
    decimal Amount,
    bool IsSurcharge = false,
    bool IsTax = false
);

public record FeeCalculationResultDto(
    string Activity,
    string ApplicationType,
    string? Element,
    string FormulaApplied,
    decimal SubTotal,
    decimal SurchargeAmount,
    decimal TaxAmount,
    decimal TotalAmount,
    List<CalculatedFeeLineItemDto> LineItems,
    ServiceCategoryType? Category = null
);

public record FeeCalculationRequest(
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
    Guid? ElementId = null,
    IReadOnlyList<ServiceVariantFee>? VariantFees = null,
    IReadOnlyList<ServiceVariantElementFee>? ElementFees = null
);
