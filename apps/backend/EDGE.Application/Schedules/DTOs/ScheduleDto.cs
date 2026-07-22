namespace EDGE.Application.Schedules.DTOs;

public record ScheduleDto(
    Guid Id,
    Guid ServiceId,
    Guid TenantId,
    Guid? ApplicationId,
    string? SeatNumber,
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
