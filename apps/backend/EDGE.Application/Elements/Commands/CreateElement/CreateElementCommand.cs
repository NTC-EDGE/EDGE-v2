using MediatR;
using EDGE.Application.Elements.DTOs;

namespace EDGE.Application.Elements.Commands.CreateElement;

public record CreateElementCommand(
    string Name,
    string Code,
    string? Description
) : IRequest<ElementDto>;
