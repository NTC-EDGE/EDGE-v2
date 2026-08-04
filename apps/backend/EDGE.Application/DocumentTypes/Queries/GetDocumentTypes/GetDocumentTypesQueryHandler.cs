using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.DocumentTypes.DTOs;

namespace EDGE.Application.DocumentTypes.Queries.GetDocumentTypes;

public class GetDocumentTypesQueryHandler : IRequestHandler<GetDocumentTypesQuery, PaginatedApiResponse<DocumentTypeDto>>
{
    private readonly IDocumentTypeRepository _repository;

    public GetDocumentTypesQueryHandler(IDocumentTypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<DocumentTypeDto>> Handle(GetDocumentTypesQuery request, CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllAsync(request.ActiveOnly, cancellationToken);
        var queryable = items.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Category) && request.Category != "ALL")
        {
            queryable = queryable.Where(d => d.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            queryable = queryable.Where(d =>
                d.Name.ToLower().Contains(term) ||
                d.Code.ToLower().Contains(term) ||
                (d.Description != null && d.Description.ToLower().Contains(term))
            );
        }

        var totalCount = queryable.Count();
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var paginated = queryable
            .OrderBy(d => d.Code)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new DocumentTypeDto
            {
                Id = d.Id,
                Code = d.Code,
                Name = d.Name,
                Description = d.Description,
                Category = d.Category,
                IsActive = d.IsActive
            })
            .ToList();

        return new PaginatedApiResponse<DocumentTypeDto>(paginated, pageNumber, pageSize, totalCount);
    }
}
