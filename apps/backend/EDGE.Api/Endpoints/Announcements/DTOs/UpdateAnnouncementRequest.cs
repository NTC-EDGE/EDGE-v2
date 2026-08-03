using System;

namespace EDGE.Api.Endpoints.Announcements.DTOs;

public record UpdateAnnouncementRequest(
    string Title,
    string Message,
    string Type,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate,
    string TargetAudience
);
