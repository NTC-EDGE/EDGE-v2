using System;
using MediatR;
using EDGE.Application.ServiceVariantElementFees.DTOs;
using EDGE.Domain.Enums;

namespace EDGE.Application.ServiceVariantElementFees.Commands.CreateServiceVariantElementFee;

public record CreateServiceVariantElementFeeCommand(
    Guid ServiceVariantId,
    Guid ElementId,
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
) : IRequest<ServiceVariantElementFeeDto>;
