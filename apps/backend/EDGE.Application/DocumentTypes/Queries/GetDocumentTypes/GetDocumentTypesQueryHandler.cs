using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.DocumentTypes.DTOs;

namespace EDGE.Application.DocumentTypes.Queries.GetDocumentTypes;

public class GetDocumentTypesQueryHandler : IRequestHandler<GetDocumentTypesQuery, List<DocumentTypeDto>>
{
    private readonly IDocumentTypeRepository _repository;

    public GetDocumentTypesQueryHandler(IDocumentTypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<DocumentTypeDto>> Handle(GetDocumentTypesQuery request, CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllAsync(request.ActiveOnly, cancellationToken);

        return items.Select(d => new DocumentTypeDto
        {
            Id = d.Id,
            Code = d.Code,
            Name = d.Name,
            Description = d.Description,
            Category = d.Category,
            IsActive = d.IsActive
        }).ToList();
    }
}
