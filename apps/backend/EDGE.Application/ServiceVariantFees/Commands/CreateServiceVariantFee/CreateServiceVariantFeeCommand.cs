using System;
using MediatR;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Commands.CreateServiceVariantFee;

public record CreateServiceVariantFeeCommand(
    Guid ServiceVariantId,
    Guid FeeId,
    decimal Amount
) : IRequest<ServiceVariantFeeDto>;
