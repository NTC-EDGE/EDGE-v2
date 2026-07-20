using MediatR;

namespace EDGE.Application.Applications.Commands;

public record DeleteApplicationCommand(Guid Id) : IRequest<bool>;
