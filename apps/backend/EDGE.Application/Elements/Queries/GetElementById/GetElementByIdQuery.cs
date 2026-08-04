using System;
using MediatR;
using EDGE.Application.Elements.DTOs;

namespace EDGE.Application.Elements.Queries.GetElementById;

public record GetElementByIdQuery(Guid Id) : IRequest<ElementDto?>;
