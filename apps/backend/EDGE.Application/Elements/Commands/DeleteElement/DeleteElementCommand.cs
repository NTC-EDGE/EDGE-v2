using System;
using MediatR;

namespace EDGE.Application.Elements.Commands.DeleteElement;

public record DeleteElementCommand(Guid Id) : IRequest<bool>;
