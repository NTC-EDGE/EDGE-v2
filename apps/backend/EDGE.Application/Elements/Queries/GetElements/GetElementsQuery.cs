using MediatR;
using System.Collections.Generic;
using EDGE.Application.Elements.DTOs;

namespace EDGE.Application.Elements.Queries.GetElements;

public record GetElementsQuery() : IRequest<List<ElementDto>>;
