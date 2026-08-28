namespace EDGE.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
    public bool IsDeleted { get; set; }

    /// <summary>
    /// Identifier of the user/system that soft-deleted this entity.
    /// Non-nullable database column: defaults to <see cref="string.Empty"/> when active or restored.
    /// DO NOT assign <c>null</c>.
    /// </summary>
    public string IsDeletedBy { get; set; } = string.Empty;
}

