using MediatR;

namespace EDGE.Application.Fees.Commands.DeleteFee;

public record DeleteFeeCommand(Guid Id) : IRequest<bool>;
