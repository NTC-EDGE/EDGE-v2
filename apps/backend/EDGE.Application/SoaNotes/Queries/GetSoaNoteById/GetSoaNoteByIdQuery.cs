using System;
using MediatR;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Queries.GetSoaNoteById;

public record GetSoaNoteByIdQuery(Guid Id) : IRequest<SoaNoteDto?>;
