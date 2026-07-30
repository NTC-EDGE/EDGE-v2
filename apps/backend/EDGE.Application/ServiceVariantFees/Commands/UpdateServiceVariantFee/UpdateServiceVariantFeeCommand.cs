using System;
using MediatR;
using EDGE.Application.ServiceVariantFees.DTOs;

namespace EDGE.Application.ServiceVariantFees.Commands.UpdateServiceVariantFee;

public record UpdateServiceVariantFeeCommand(
    Guid Id,
    Guid ServiceVariantId,
    Guid FeeId,
    decimal Amount
) : IRequest<ServiceVariantFeeDto?>;
