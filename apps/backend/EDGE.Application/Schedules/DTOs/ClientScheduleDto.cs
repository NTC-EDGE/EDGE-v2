namespace EDGE.Application.Schedules.DTOs;

public record ClientScheduleDto(
    Guid Id,
    Guid ServiceId,
    Guid TenantId,
    string? SeatNumber,
    string Venue,
    DateTime StartDate,
    DateTime EndDate,
    DateTime? StartApplication,
    DateTime? EndApplication,
    bool IsPublished,
    int? MaximumSlots,
    string? Remarks
);
