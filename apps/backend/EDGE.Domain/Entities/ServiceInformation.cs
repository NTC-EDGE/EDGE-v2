using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ServiceInformation : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public Service? Service { get; set; }
    public string Information { get; set; } = string.Empty;
    public string WhoMayAvail { get; set; } = string.Empty;
}
