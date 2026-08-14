using MediatR;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Commands.CreateSoaNote;

public record CreateSoaNoteCommand(string Notes, string? Code = null, string? Title = null) : IRequest<SoaNoteDto>;
