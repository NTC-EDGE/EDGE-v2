using System.Text.Json;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Service : AuditableEntity
{
    public Guid ServiceCategoryId { get; set; }
    public virtual ServiceCategory ServiceCategory { get; set; } = null!;

    public Guid TenantId { get; set; }
    public virtual Tenant Tenant { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string? Group { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// Dynamic JSON contract stored as jsonb in PostgreSQL.
    /// Must contain at minimum: formNo. May require examineeTypes (Exams) or elements (TechnicalApplications).
    /// </summary>
    public JsonDocument Contract { get; set; } = JsonDocument.Parse("{}");

    public virtual List<ServiceVariant> Variants { get; set; } = [];
}
