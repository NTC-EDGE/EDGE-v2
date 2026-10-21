using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SoaNotes.DTOs;

namespace EDGE.Application.SoaNotes.Queries.GetSoaNoteById;

public class GetSoaNoteByIdQueryHandler : IRequestHandler<GetSoaNoteByIdQuery, SoaNoteDto?>
{
    private readonly ISoaNoteRepository _soaNoteRepository;

    public GetSoaNoteByIdQueryHandler(ISoaNoteRepository soaNoteRepository)
    {
        _soaNoteRepository = soaNoteRepository;
    }

    public async Task<SoaNoteDto?> Handle(GetSoaNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var soaNote = await _soaNoteRepository.GetByIdAsync(request.Id, cancellationToken);
        if (soaNote == null) return null;

        return new SoaNoteDto
        {
            Id = soaNote.Id,
            TenantId = soaNote.TenantId,
            TenantName = soaNote.Tenant?.Name,
            Code = soaNote.Code,
            Title = soaNote.Title,
            Notes = soaNote.Notes,
            CreatedAt = soaNote.CreatedAt,
            CreatedBy = soaNote.CreatedBy,
            LastModifiedAt = soaNote.LastModifiedAt,
            LastModifiedBy = soaNote.LastModifiedBy
        };
    }
}
