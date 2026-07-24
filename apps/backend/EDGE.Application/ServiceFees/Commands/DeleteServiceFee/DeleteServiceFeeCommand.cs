using MediatR;

namespace EDGE.Application.ServiceFees.Commands.DeleteServiceFee;

public record DeleteServiceFeeCommand(Guid Id) : IRequest<bool>;
