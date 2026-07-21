using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class Fee : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual ICollection<ServiceFee> ServiceFees { get; set; } = new List<ServiceFee>();
}
