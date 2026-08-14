using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using EDGE.Domain.Common;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Infrastructure.Persistence.Interceptors;

public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    public AuditableEntitySaveChangesInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
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

        var userId = _currentUserService.UserId ?? "System";
        var auditLogs = new List<AuditLog>();

        context.ChangeTracker.DetectChanges();

        foreach (var entry in context.ChangeTracker.Entries().ToList())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var originalState = entry.State;

            // 1. Populate Auditable Fields
            if (entry.Entity is AuditableEntity auditable)
            {
                if (entry.State == EntityState.Added)
                {
                    auditable.CreatedAt = DateTime.UtcNow;
                    auditable.CreatedBy = userId;
                }
                else if (entry.State == EntityState.Modified)
                {
                    auditable.LastModifiedAt = DateTime.UtcNow;
                    auditable.LastModifiedBy = userId;
                }
                else if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    auditable.IsDeleted = true;
                    auditable.IsDeletedBy = userId;
                    auditable.LastModifiedAt = DateTime.UtcNow;
                    auditable.LastModifiedBy = userId;
                }
            }

            if (entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

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
            catch
            {
                // Ignored if property access is unsupported
            }

            // 3. Generate Audit Logs
            var auditEntry = new AuditEntry(entry)
            {
                EntityName = entry.Entity.GetType().Name,
                ChangedBy = userId,
                TenantId = tenantId
            };

            try
            {
                foreach (var property in entry.Properties)
                {
                    if (entry.State == EntityState.Detached) break;

                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.KeyValues[propertyName] = property.CurrentValue;
                        continue;
                    }

                    switch (originalState)
                    {
                        case EntityState.Added:
                            auditEntry.Action = "Insert";
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                            break;

                        case EntityState.Deleted:
                            auditEntry.Action = "Delete";
                            try
                            {
                                auditEntry.OldValues[propertyName] = property.OriginalValue;
                            }
                            catch
                            {
                                auditEntry.OldValues[propertyName] = property.CurrentValue;
                            }
                            break;

                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                auditEntry.Action = "Update";
                                try
                                {
                                    auditEntry.OldValues[propertyName] = property.OriginalValue;
                                }
                                catch
                                {
                                    auditEntry.OldValues[propertyName] = null;
                                }
                                auditEntry.NewValues[propertyName] = property.CurrentValue;
                            }
                            break;
                    }
                }
            }
            catch
            {
                // Skip entity audit logging if entry state became invalid
            }

            if (!string.IsNullOrEmpty(auditEntry.Action))
            {
                auditLogs.Add(auditEntry.ToAuditLog());
            }
        }

        if (auditLogs.Any())
        {
            context.Set<AuditLog>().AddRange(auditLogs);
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
