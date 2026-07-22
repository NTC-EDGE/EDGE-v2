using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Notes.DTOs;

namespace EDGE.Application.Notes.Queries.GetAllNotes;

public class GetAllNotesQueryHandler : IRequestHandler<GetAllNotesQuery, PaginatedApiResponse<NoteDto>>
{
    private readonly INoteRepository _noteRepository;

    public GetAllNotesQueryHandler(INoteRepository noteRepository)
    {
        _noteRepository = noteRepository;
    }

    public async Task<PaginatedApiResponse<NoteDto>> Handle(GetAllNotesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var (items, totalCount) = await _noteRepository.GetPagedAsync(pageNumber, pageSize, cancellationToken);

        var noteDtos = items.Select(n => new NoteDto
        {
            Id = n.Id,
            Notes = n.Notes,
            ServiceCategoryId = n.ServiceCategoryId,
            CreatedAt = n.CreatedAt,
            CreatedBy = n.CreatedBy,
            LastModifiedAt = n.LastModifiedAt,
            LastModifiedBy = n.LastModifiedBy
        }).ToList();

        return new PaginatedApiResponse<NoteDto>(noteDtos, pageNumber, pageSize, totalCount);
    }
}
