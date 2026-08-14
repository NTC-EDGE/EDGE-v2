using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Queries.GetAllSoaNotes;

public class GetAllSoaNotesQueryHandler : IRequestHandler<GetAllSoaNotesQuery, PaginatedApiResponse<SoaNoteDto>>
{
    private readonly ISoaNoteRepository _soaNoteRepository;

    public GetAllSoaNotesQueryHandler(ISoaNoteRepository soaNoteRepository)
    {
        _soaNoteRepository = soaNoteRepository;
    }

    public async Task<PaginatedApiResponse<SoaNoteDto>> Handle(GetAllSoaNotesQuery request, CancellationToken cancellationToken)
    {
        int pageNumber = request.PageNumber ?? 1;
        int pageSize = request.PageSize ?? 20;
        if (pageSize <= 0) pageSize = 1;

        var (items, totalCount) = await _soaNoteRepository.GetPagedAsync(pageNumber, pageSize, request.SearchTerm, cancellationToken);

        var dtos = items.Select(n => new SoaNoteDto
        {
            Id = n.Id,
            Code = n.Code,
            Title = n.Title,
            Notes = n.Notes,
            CreatedAt = n.CreatedAt,
            CreatedBy = n.CreatedBy,
            LastModifiedAt = n.LastModifiedAt,
            LastModifiedBy = n.LastModifiedBy
        }).ToList();

        return new PaginatedApiResponse<SoaNoteDto>(dtos, pageNumber, pageSize, totalCount);
    }
}
