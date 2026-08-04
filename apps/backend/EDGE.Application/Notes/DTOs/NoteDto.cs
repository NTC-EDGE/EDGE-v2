namespace EDGE.Application.Notes.DTOs;

public class NoteDto
{
    public Guid Id { get; set; }
    public string Notes { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public Guid? ServiceVariantId { get; set; }
    public string? ServiceName { get; set; }
    public string? ServiceVariantName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
}
