namespace EDGE.Application.Schedules.DTOs;

public record ClientScheduleDto(
    Guid Id,
    Guid ServiceId,
    Guid TenantId,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? StartApplication,
    DateTime? EndApplication,
    bool IsPublished,
    int? MaximumSlots,
    string? Remarks,
    string? StartTime = null,
    string? EndTime = null,
    string? RegionName = null
);
