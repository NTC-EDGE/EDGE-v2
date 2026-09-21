using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using EDGE.Domain.Common;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Interceptors;

public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuditableEntitySaveChangesInterceptor>? _logger;

    public AuditableEntitySaveChangesInterceptor(
        ICurrentUserService currentUserService,
        ILogger<AuditableEntitySaveChangesInterceptor>? logger = null)
    {
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        AuditAndSave(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        AuditAndSave(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AuditAndSave(DbContext? context)
    {
        if (context == null) return;

        try
        {
            var userId = _currentUserService.UserId ?? "System";
            var auditLogs = new List<AuditLog>();

            try
            {
                context.ChangeTracker.DetectChanges();
            }
            catch (Exception ex)
            {
                _logger?.LogWarning(ex, "Failed to execute DetectChanges during SaveChanges audit interception.");
            }

            var entries = context.ChangeTracker.Entries().ToList();

            foreach (var entry in entries)
            {
                try
                {
                    if (entry == null || entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                        continue;

                    var originalState = entry.State;

                    // 1. Populate Auditable Fields
                    if (entry.Entity is AuditableEntity auditable)
                    {
                        if (originalState == EntityState.Added)
                        {
                            auditable.CreatedAt = DateTime.UtcNow;
                            auditable.CreatedBy = userId;
                        }
                        else if (originalState == EntityState.Modified)
                        {
                            auditable.LastModifiedAt = DateTime.UtcNow;
                            auditable.LastModifiedBy = userId;
                        }
                        else if (originalState == EntityState.Deleted)
                        {
                            entry.State = EntityState.Modified;
                            auditable.IsDeleted = true;
                            auditable.IsDeletedBy = userId;
                            auditable.LastModifiedAt = DateTime.UtcNow;
                            auditable.LastModifiedBy = userId;
                        }
                    }

                    // 2. Extract TenantId if present
                    Guid? tenantId = null;
                    try
                    {
                        var tenantProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "TenantId");
                        if (tenantProp != null && tenantProp.CurrentValue is Guid gVal)
                        {
                            tenantId = gVal;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogDebug(ex, "Could not evaluate TenantId property on entity '{EntityName}'.", entry.Entity?.GetType().Name);
                    }

                    // 3. Generate Audit Logs
                    var auditEntry = new AuditEntry(entry)
                    {
                        EntityName = entry.Entity?.GetType().Name ?? "Unknown",
                        ChangedBy = userId,
                        TenantId = tenantId
                    };

                    foreach (var property in entry.Properties)
                    {
                        string propertyName = property.Metadata.Name;
                        try
                        {
                            if (entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                                break;

                            if (property.Metadata.IsPrimaryKey())
                            {
                                try
                                {
                                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                                }
                                catch (Exception ex)
                                {
                                    _logger?.LogDebug(ex, "Could not get primary key value for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                }
                                continue;
                            }

                            switch (originalState)
                            {
                                case EntityState.Added:
                                    auditEntry.Action = "Insert";
                                    try
                                    {
                                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger?.LogDebug(ex, "Could not get new value for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                    }
                                    break;

                                case EntityState.Deleted:
                                    auditEntry.Action = "Delete";
                                    try
                                    {
                                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger?.LogDebug(ex, "Could not get original value for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                    }
                                    break;

                                case EntityState.Modified:
                                    bool isModified = false;
                                    try
                                    {
                                        isModified = property.IsModified;
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger?.LogDebug(ex, "Could not check IsModified for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                    }

                                    if (isModified)
                                    {
                                        auditEntry.Action = "Update";
                                        try
                                        {
                                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                                        }
                                        catch (Exception ex)
                                        {
                                            _logger?.LogDebug(ex, "Could not get original value for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                        }

                                        try
                                        {
                                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                                        }
                                        catch (Exception ex)
                                        {
                                            _logger?.LogDebug(ex, "Could not get current value for '{PropertyName}' on '{EntityName}'.", propertyName, entry.Entity?.GetType().Name);
                                        }
                                    }
                                    break;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogWarning(ex, "Could not read property '{PropertyName}' on entity '{EntityName}' during audit log generation [State: {State}].", propertyName, entry.Entity?.GetType().Name, originalState);
                        }
                    }

                    if (!string.IsNullOrEmpty(auditEntry.Action))
                    {
                        auditLogs.Add(auditEntry.ToAuditLog());
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to capture audit log for entity '{EntityName}' [State: {State}].", entry.Entity?.GetType().Name, entry.State);
                }
            }

            if (auditLogs.Any())
            {
                try
                {
                    context.Set<AuditLog>().AddRange(auditLogs);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to append {Count} generated audit logs to DbContext.", auditLogs.Count);
                }
            }
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Unexpected error in AuditableEntitySaveChangesInterceptor. Primary transaction will proceed.");
        }
    }
}

internal class AuditEntry
{
    public AuditEntry(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry) { Entry = entry; }
    public Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry Entry { get; }
    public Guid? TenantId { get; set; }
    public string EntityName { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string ChangedBy { get; set; } = null!;
    public Dictionary<string, object?> KeyValues { get; } = new();
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();

    public AuditLog ToAuditLog() => new()
    {
        TenantId = TenantId,
        EntityName = EntityName,
        Action = Action,
        ChangedBy = ChangedBy,
        ChangedAt = DateTime.UtcNow,
        KeyValues = JsonSerializer.Serialize(KeyValues),
        OldValues = OldValues.Any() ? JsonSerializer.Serialize(OldValues) : null,
        NewValues = NewValues.Any() ? JsonSerializer.Serialize(NewValues) : null
    };
}
