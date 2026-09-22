using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.DTOs;

public class ConversationParticipantDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty;
    public ParticipantRole Role { get; set; }
    public bool IsMuted { get; set; }
    public DateTimeOffset? LastReadAt { get; set; }
}

public class ConversationDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public ConversationType Type { get; set; }
    public ConversationScope Scope { get; set; }
    public Guid? TenantId { get; set; }
    public string? TenantName { get; set; }
    public DateTimeOffset? LastMessageAt { get; set; }
    public string? LastMessagePreview { get; set; }
    public int UnreadCount { get; set; }
    public List<ConversationParticipantDto> Participants { get; set; } = new();
}
