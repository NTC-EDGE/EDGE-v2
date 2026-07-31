using System.Collections.Generic;
using MediatR;
using EDGE.Application.DocumentTypes.DTOs;

namespace EDGE.Application.DocumentTypes.Queries.GetDocumentTypes;

public record GetDocumentTypesQuery(bool ActiveOnly = false) : IRequest<List<DocumentTypeDto>>;
