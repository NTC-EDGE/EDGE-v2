using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SoaNote : AuditableEntity
{
    public Guid StatementOfAccountId { get; set; }
    public virtual StatementOfAccount? StatementOfAccount { get; set; }

    public string Notes { get; set; } = string.Empty;
}
