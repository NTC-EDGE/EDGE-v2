using EDGE.Domain.Common;

namespace EDGE.Domain.Entities;

public class MessageAttachment : AuditableEntity
{
    public Guid ChatMessageId { get; set; }
    public virtual ChatMessage ChatMessage { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string StoragePath { get; set; } = string.Empty;
}
