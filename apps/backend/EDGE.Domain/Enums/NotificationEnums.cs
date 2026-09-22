namespace EDGE.Domain.Enums;

public enum NotificationType
{
    ChatMessage = 1,
    GroupMention = 2,
    MeetingInvite = 3,
    MeetingStarted = 4,
    SystemAnnouncement = 5
}

public enum NotificationChannel
{
    InApp = 1,
    Email = 2,
    Push = 3
}
