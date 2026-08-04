using System;
using MediatR;

namespace EDGE.Application.ServiceVariantElementFees.Commands.DeleteServiceVariantElementFee;

public record DeleteServiceVariantElementFeeCommand(Guid Id) : IRequest<bool>;
