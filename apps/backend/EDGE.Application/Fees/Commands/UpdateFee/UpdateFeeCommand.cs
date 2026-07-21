using MediatR;
using EDGE.Application.Fees.DTOs;

namespace EDGE.Application.Fees.Commands.UpdateFee;

public record UpdateFeeCommand(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    bool IsActive
) : IRequest<FeeDto?>;
