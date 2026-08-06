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
            notes = notes.Where(n => 
                n.Notes.ToLower().Contains(search) ||
                (n.Service != null && n.Service.Name.ToLower().Contains(search)) ||
                (n.ServiceVariant != null && n.ServiceVariant.Type.ToString().ToLower().Contains(search)) ||
                (n.ServiceVariant != null && n.ServiceVariant.Description != null && n.ServiceVariant.Description.ToLower().Contains(search))
            ).ToList();
        }

        if (request.ServiceId.HasValue)
        {
            notes = notes.Where(n => n.ServiceId == request.ServiceId.Value).ToList();
        }

        if (request.ServiceVariantId.HasValue)
        {
            notes = notes.Where(n => n.ServiceVariantId == request.ServiceVariantId.Value).ToList();
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
