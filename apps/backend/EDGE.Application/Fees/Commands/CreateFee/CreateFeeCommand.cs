using MediatR;
using EDGE.Application.Fees.DTOs;

namespace EDGE.Application.Fees.Commands.CreateFee;

public record CreateFeeCommand(
    string Code,
    string Name,
    string? Description
) : IRequest<FeeDto>;
