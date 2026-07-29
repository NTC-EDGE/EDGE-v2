using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.AuditLogs.DTOs;

namespace EDGE.Application.AuditLogs.Queries.GetAuditLogs;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, (List<AuditLogDto> Items, int TotalCount)>
{
    private readonly IAuditLogRepository _repository;

    public GetAuditLogsQueryHandler(IAuditLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<(List<AuditLogDto> Items, int TotalCount)> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedAuditLogsAsync(request.PageNumber, request.PageSize, request.SearchTerm, cancellationToken);
        var dtos = items.Select(a => new AuditLogDto
        {
            Id = a.Id,
            Action = a.Action,
            EntityName = a.EntityName,
            EntityId = a.KeyValues ?? string.Empty,
            UserId = a.ChangedBy ?? string.Empty,
            Changes = a.NewValues ?? a.OldValues ?? string.Empty,
            Timestamp = a.ChangedAt
        }).ToList();

        return (dtos, totalCount);
    }
}
