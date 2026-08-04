using System;
using MediatR;
using EDGE.Application.Elements.DTOs;

namespace EDGE.Application.Elements.Commands.UpdateElement;

public record UpdateElementCommand(
    Guid Id,
    string Name,
    string Code,
    string? Description
) : IRequest<ElementDto?>;
