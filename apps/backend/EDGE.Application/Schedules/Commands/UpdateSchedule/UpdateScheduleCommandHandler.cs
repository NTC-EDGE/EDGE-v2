using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.UpdateSchedule;

public class UpdateScheduleCommandHandler : IRequestHandler<UpdateScheduleCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto?> Handle(UpdateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        if (schedule.IsPublished)
        {
            throw new InvalidOperationException("Published schedules cannot be edited. Please unpublish the schedule to draft status before making changes.");
        }

        schedule.Venue = request.Venue;
        schedule.StartDate = ToUtc(request.StartDate);
        schedule.EndDate = ToUtc(request.EndDate);
        schedule.StartApplication = ToUtc(request.StartApplication);
        schedule.EndApplication = ToUtc(request.EndApplication);
        schedule.MaximumSlots = request.MaximumSlots;
        schedule.Remarks = request.Remarks;

        _scheduleRepository.Update(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            schedule.Service?.Name,
            schedule.Service?.Code,
            schedule.TenantId,
            schedule.Venue,
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartApplication,
            schedule.EndApplication,
            schedule.IsPublished,
            schedule.MaximumSlots,
            schedule.Remarks,
            schedule.CreatedAt
        );
    }

    private static DateTime ToUtc(DateTime dateTime)
    {
        return dateTime.Kind == DateTimeKind.Utc
            ? dateTime
            : DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
    }

    private static DateTime? ToUtc(DateTime? dateTime)
    {
        if (!dateTime.HasValue) return null;
        return dateTime.Value.Kind == DateTimeKind.Utc
            ? dateTime.Value
            : DateTime.SpecifyKind(dateTime.Value, DateTimeKind.Utc);
    }
}
