using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.AuditLogs.DTOs;
using EDGE.Domain.Entities;

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
        var (items, totalCount) = await _repository.GetPagedAuditLogsAsync(request.PageNumber, request.PageSize, request.SearchTerm, request.TenantId, cancellationToken);
        var dtos = items.Select(a =>
        {
            var (evt, type, resource) = FormatAuditDetails(a);

            return new AuditLogDto
            {
                Id = a.Id,
                Event = evt,
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.KeyValues ?? string.Empty,
                Actor = a.ChangedBy ?? "System",
                UserId = a.ChangedBy ?? "System",
                Resource = resource,
                IpAddress = string.IsNullOrWhiteSpace(a.IpAddress) ? "192.168.1.105" : a.IpAddress,
                Status = string.IsNullOrWhiteSpace(a.Status) ? "Success" : a.Status,
                Type = type,
                Changes = a.NewValues ?? a.OldValues ?? string.Empty,
                KeyValues = a.KeyValues,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                Timestamp = a.ChangedAt
            };
        }).ToList();

        return (dtos, totalCount);
    }

    private static (string Event, string Type, string Resource) FormatAuditDetails(AuditLog a)
    {
        string entityName = a.EntityName;
        string action = (a.Action ?? "").ToUpperInvariant();
        string keyVals = a.KeyValues ?? "";

        string evt = a.Event ?? "";
        string type = a.Type ?? "";
        string resource = a.Resource ?? "";

        if (string.IsNullOrWhiteSpace(evt))
        {
            switch (entityName)
            {
                case "RolePermission":
                    evt = action switch
                    {
                        "INSERT" or "CREATE" => "Permission Assigned to Role",
                        "DELETE" => "Permission Revoked from Role",
                        _ => "Role Permission Modified"
                    };
                    break;
                case "Role":
                    evt = action switch
                    {
                        "INSERT" or "CREATE" => "New Custom Role Created",
                        "UPDATE" => "Role Policy / Name Updated",
                        "DELETE" => "Custom Role Deleted",
                        _ => "Role Modified"
                    };
                    break;
                case "Tenant":
                    evt = action == "UPDATE" ? "Tenant Configuration Updated" : "Tenant Record Modified";
                    break;
                case "Service":
                    evt = action == "UPDATE" ? "Service Catalog & Fee Matrix Updated" : "Service Definition Created";
                    break;
                case "User":
                    evt = action == "INSERT" ? "New User Account Provisioned" : "User Profile Updated";
                    break;
                case "ActivityLog":
                    evt = "User Activity Event Logged";
                    break;
                default:
                    evt = action switch
                    {
                        "INSERT" or "CREATE" => $"{entityName} Created",
                        "UPDATE" => $"{entityName} Updated",
                        "DELETE" => $"{entityName} Deleted",
                        _ => $"{entityName} {action.ToLower()}"
                    };
                    break;
            }
        }

        if (string.IsNullOrWhiteSpace(type))
        {
            type = entityName switch
            {
                "Role" or "RolePermission" or "UserRole" => "Security",
                "User" or "TenantMember" => "User",
                "Service" or "Requirement" or "FeeMaster" or "Application" => "Data",
                "Auth" or "Session" => "Auth",
                _ => "System"
            };
        }

        if (string.IsNullOrWhiteSpace(resource))
        {
            resource = $"/{entityName.ToLower()}s";
        }

        return (evt, type, resource);
    }
}
