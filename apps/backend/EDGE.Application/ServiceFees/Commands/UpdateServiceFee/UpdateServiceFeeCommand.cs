using MediatR;
using EDGE.Application.ServiceFees.DTOs;

namespace EDGE.Application.ServiceFees.Commands.UpdateServiceFee;

public record UpdateServiceFeeCommand(
    Guid Id,
    Guid ServiceId,
    Guid FeeId,
    decimal Amount,
    bool IsActive
) : IRequest<ServiceFeeDto?>;
