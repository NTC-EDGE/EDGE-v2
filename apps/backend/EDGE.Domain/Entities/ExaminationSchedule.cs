using System;
using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class ExaminationSchedule : AuditableEntity
{
    public Guid ServiceId { get; set; }
    public Service? Service { get; set; }
    public DateTime ExamDate { get; set; }
    public string Venue { get; set; } = string.Empty;
    public int MaxSlots { get; set; }
    public int AvailableSlots { get; set; }
}
