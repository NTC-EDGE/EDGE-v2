using MediatR;
using EDGE.Application.Fees.DTOs;

namespace EDGE.Application.Fees.Commands.SetFeeStatus;

public record SetFeeStatusCommand(Guid Id, bool IsActive) : IRequest<FeeDto?>;
