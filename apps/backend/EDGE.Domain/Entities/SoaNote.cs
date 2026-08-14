using System;
using System.Collections.Generic;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class SoaNote : AuditableEntity
{
    public string? Code { get; set; }
    public string? Title { get; set; }
    public string Notes { get; set; } = string.Empty;

    public virtual ICollection<StatementOfAccount> StatementsOfAccount { get; set; } = new List<StatementOfAccount>();
}
