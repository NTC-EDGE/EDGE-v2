namespace EDGE.Application.Notes.DTOs;

public class NoteDto
{
    public Guid Id { get; set; }
    public string Notes { get; set; } = string.Empty;
    public Guid ServiceCategoryId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? LastModifiedAt { get; set; }
    public string? LastModifiedBy { get; set; }
}
