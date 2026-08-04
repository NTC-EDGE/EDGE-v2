using MediatR;

namespace EDGE.Application.ServiceVariantElements.Commands.DeleteServiceVariantElement;

public record DeleteServiceVariantElementCommand(Guid Id) : IRequest<bool>;
