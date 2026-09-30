using System;
using MediatR;
using EDGE.Application.ServiceVariantFees.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceVariantFees.Commands.CreateServiceVariantFee;

public record CreateServiceVariantFeeCommand(
    Guid ServiceVariantId,
    Guid FeeId,
    decimal Amount,
    FeeCalculationMode CalculationMode = FeeCalculationMode.StandardMultiplier,
    string? CalculationFormula = null,
    bool MultiplyByValidityYears = false,
    bool MultiplyByUnits = false,
    bool MultiplyByChannels = false,
    bool MultiplyByPages = false,
    bool ApplyLateRenewalSurcharge = false,
    bool IncludeDst = true,
    decimal DstAmount = 30.00m
) : IRequest<ServiceVariantFeeDto>;
