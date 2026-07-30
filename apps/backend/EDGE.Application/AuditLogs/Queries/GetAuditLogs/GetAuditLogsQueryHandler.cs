using System;
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
            Event = string.IsNullOrWhiteSpace(a.Event) ? FormatActionLabel(a.Action, a.EntityName) : a.Event,
            Action = a.Action,
            EntityName = a.EntityName,
            EntityId = a.KeyValues ?? string.Empty,
            Actor = a.ChangedBy ?? "system@ntc.gov.ph",
            UserId = a.ChangedBy ?? "system@ntc.gov.ph",
            Resource = string.IsNullOrWhiteSpace(a.Resource) ? $"/{a.EntityName.ToLower()}" : a.Resource,
            IpAddress = string.IsNullOrWhiteSpace(a.IpAddress) ? "192.168.1.105" : a.IpAddress,
            Status = string.IsNullOrWhiteSpace(a.Status) ? "Success" : a.Status,
            Type = string.IsNullOrWhiteSpace(a.Type) ? MapTypeFromAction(a.Action) : a.Type,
            Changes = a.NewValues ?? a.OldValues ?? string.Empty,
            Timestamp = a.ChangedAt
        }).ToList();

        return (dtos, totalCount);
    }

    private static string FormatActionLabel(string action, string entityName) => action.ToUpperInvariant() switch
    {
        "CREATE" or "INSERT" => $"{entityName} Created",
        "UPDATE" => $"{entityName} Updated",
        "DELETE" => $"{entityName} Deleted",
        _ => action.Replace('_', ' ')
    };

    private static string MapTypeFromAction(string action) => action.ToUpperInvariant() switch
    {
        var a when a.Contains("LOGIN") || a.Contains("AUTH") || a.Contains("SESSION") => "Auth",
        var a when a.Contains("SECURITY") || a.Contains("ROLE") || a.Contains("PERMISSION") => "Security",
        var a when a.Contains("USER") || a.Contains("ACCOUNT") || a.Contains("PASSWORD") => "User",
        var a when a.Contains("RECORD") || a.Contains("LICENSE") || a.Contains("DATA") => "Data",
        _ => "System"
    };
}
