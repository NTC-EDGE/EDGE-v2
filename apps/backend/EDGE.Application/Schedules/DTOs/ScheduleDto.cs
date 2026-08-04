namespace EDGE.Application.Schedules.DTOs;

public record ScheduleDto(
    Guid Id,
    Guid ServiceId,
    string? ServiceName,
    string? ServiceCode,
    Guid TenantId,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? StartApplication,
    DateTime? EndApplication,
    bool IsPublished,
    int? MaximumSlots,
    string? Remarks,
    DateTime CreatedAt
);
