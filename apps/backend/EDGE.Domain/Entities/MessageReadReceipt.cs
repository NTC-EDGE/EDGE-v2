using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class MessageReadReceipt : BaseEntity
{
    public Guid ChatMessageId { get; set; }
    public virtual ChatMessage ChatMessage { get; set; } = null!;

    public Guid UserId { get; set; }
    public virtual User User { get; set; } = null!;

    public DateTimeOffset ReadAt { get; set; } = DateTimeOffset.UtcNow;
}
