using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Note : AuditableEntity
{
    public string Notes { get; set; } = string.Empty;
    public Guid ServiceCategoryId { get; set; }
}
