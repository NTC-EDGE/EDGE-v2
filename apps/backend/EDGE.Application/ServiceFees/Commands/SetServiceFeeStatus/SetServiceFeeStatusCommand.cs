using MediatR;
using EDGE.Application.ServiceFees.DTOs;

namespace EDGE.Application.ServiceFees.Commands.SetServiceFeeStatus;

public record SetServiceFeeStatusCommand(Guid Id, bool IsActive) : IRequest<ServiceFeeDto?>;
