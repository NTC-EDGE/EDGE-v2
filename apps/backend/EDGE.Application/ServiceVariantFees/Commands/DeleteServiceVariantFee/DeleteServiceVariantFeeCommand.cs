using System;
using MediatR;

namespace EDGE.Application.ServiceVariantFees.Commands.DeleteServiceVariantFee;

public record DeleteServiceVariantFeeCommand(Guid Id) : IRequest<bool>;
