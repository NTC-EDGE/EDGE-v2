using MediatR;
using EDGE.Application.ServiceVariantElements.DTOs;

namespace EDGE.Application.ServiceVariantElements.Commands.CreateServiceVariantElement;

public record CreateServiceVariantElementCommand(
    Guid ServiceVariantId,
    string Code,
    string Description
) : IRequest<ServiceVariantElementDto>;
