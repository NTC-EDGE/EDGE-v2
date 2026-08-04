using System;
using MediatR;
using EDGE.Application.ServiceVariantElementFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Commands.UpdateServiceVariantElementFee;

public record UpdateServiceVariantElementFeeCommand(
    Guid Id,
    Guid ServiceVariantId,
    Guid ElementId,
    Guid FeeId,
    decimal Amount
) : IRequest<ServiceVariantElementFeeDto?>;
