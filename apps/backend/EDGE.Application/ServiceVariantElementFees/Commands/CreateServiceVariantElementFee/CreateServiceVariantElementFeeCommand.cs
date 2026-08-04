using System;
using MediatR;
using EDGE.Application.ServiceVariantElementFees.DTOs;

namespace EDGE.Application.ServiceVariantElementFees.Commands.CreateServiceVariantElementFee;

public record CreateServiceVariantElementFeeCommand(
    Guid ServiceVariantId,
    Guid ElementId,
    Guid FeeId,
    decimal Amount
) : IRequest<ServiceVariantElementFeeDto>;
