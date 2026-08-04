using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Queries.GetAllNotes;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, PaginatedApiResponse<NoteDto>>
{
    private readonly INoteRepository _noteRepository;
    private readonly IServiceCategoryRepository _categoryRepository;

    public GetAllNotesQueryHandler(INoteRepository noteRepository, IServiceCategoryRepository categoryRepository)
    {
        _noteRepository = noteRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<PaginatedApiResponse<NoteDto>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var notes = await _noteRepository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.ToLower();
            
            // Search in notes content
            var contentMatches = notes.Where(n => n.Notes.ToLower().Contains(search)).ToList();
            
            // Also search in service categories
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);
            var matchingCategoryIds = categories
                .Where(c => c.Name.ToLower().Contains(search))
                .Select(c => c.Id)
                .ToHashSet();

            var categoryMatches = notes.Where(n => n.Service != null && matchingCategoryIds.Contains(n.Service.ServiceCategoryId)).ToList();

            // Combine and distinct
            notes = contentMatches.Union(categoryMatches).ToList();
        }

        int totalCount = notes.Count;
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 10;
        if (pageSize <= 0) pageSize = 1;

        var paginated = notes.OrderByDescending(n => n.CreatedAt).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        var noteDtos = paginated.Select(n => new NoteDto
        {
            Id = n.Id,
            Notes = n.Notes,
            ServiceId = n.ServiceId,
            ServiceVariantId = n.ServiceVariantId,
            ServiceName = n.Service?.Name,
            ServiceVariantName = n.ServiceVariant != null ? $"{n.ServiceVariant.Type} ({n.ServiceVariant.Description})" : null,
            CreatedAt = n.CreatedAt,
            CreatedBy = n.CreatedBy,
            LastModifiedAt = n.LastModifiedAt,
            LastModifiedBy = n.LastModifiedBy
        }).ToList();

        return new PaginatedApiResponse<NoteDto>(noteDtos, pageNumber, pageSize, totalCount);
    }
}
