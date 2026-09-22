using EDGE.Domain.Common;
using EDGE.Domain.Enums;

namespace EDGE.Domain.Entities;

public class ChatMessage : AuditableEntity
{
    public Guid ConversationId { get; set; }
    public virtual Conversation Conversation { get; set; } = null!;

    public Guid SenderId { get; set; }
    public virtual User Sender { get; set; } = null!;

    public Guid SenderTenantId { get; set; }
    public virtual Tenant SenderTenant { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; } = MessageType.Text;

    public Guid? ReplyToMessageId { get; set; }
    public virtual ChatMessage? ReplyToMessage { get; set; }

    public bool IsEdited { get; set; } = false;

    public virtual ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
    public virtual ICollection<MessageReadReceipt> ReadReceipts { get; set; } = new List<MessageReadReceipt>();
}
