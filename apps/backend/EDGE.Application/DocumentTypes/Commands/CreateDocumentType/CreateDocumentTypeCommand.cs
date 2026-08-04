using MediatR;
using EDGE.Application.DocumentTypes.DTOs;

namespace EDGE.Application.DocumentTypes.Commands.CreateDocumentType;

public record CreateDocumentTypeCommand(
    string Code,
    string Name,
    string Description,
    string Category
) : IRequest<DocumentTypeDto>;
