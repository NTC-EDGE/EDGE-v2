using MediatR;
using EDGE.Application.ServiceFees.DTOs;

namespace EDGE.Application.ServiceFees.Commands.CreateServiceFee;

public record CreateServiceFeeCommand(
    Guid ServiceId,
    Guid FeeId,
    decimal Amount
) : IRequest<ServiceFeeDto>;
