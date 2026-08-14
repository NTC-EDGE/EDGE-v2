using System;
using MediatR;

namespace EDGE.Application.SoaNotes.Commands.DeleteSoaNote;

public record DeleteSoaNoteCommand(Guid Id) : IRequest;
