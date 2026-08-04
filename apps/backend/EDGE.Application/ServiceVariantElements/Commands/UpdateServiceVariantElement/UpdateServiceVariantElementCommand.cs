using MediatR;
using EDGE.Application.ServiceVariantElements.DTOs;

namespace EDGE.Application.ServiceVariantElements.Commands.UpdateServiceVariantElement;

public record UpdateServiceVariantElementCommand(
    Guid Id,
    string Code,
    string Description
) : IRequest<ServiceVariantElementDto?>;
