using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.AuditLogs.DTOs;

namespace EDGE.Application.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery(
    int PageNumber = 1,
    int PageSize = 20,
    string? SearchTerm = null,
    Guid? TenantId = null
) : IRequest<(List<AuditLogDto> Items, int TotalCount)>;
