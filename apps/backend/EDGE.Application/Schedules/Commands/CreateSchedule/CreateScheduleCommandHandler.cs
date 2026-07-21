using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.CreateSchedule;

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, ScheduleDto>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateScheduleCommandHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = new Schedule
        {
            ServiceId = request.ServiceId,
            TenantId = request.TenantId,
            Venue = request.Venue,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            StartApplication = request.StartApplication,
            EndApplication = request.EndApplication,
            IsPublished = request.IsPublished,
            SeatNumber = request.SeatNumber,
            Remarks = request.Remarks,
            ApplicationId = request.ApplicationId
        };

        await _scheduleRepository.AddAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            schedule.TenantId,
            schedule.ApplicationId,
            schedule.SeatNumber,
            schedule.Venue,
            schedule.StartDate,
            schedule.EndDate,
            schedule.StartApplication,
            schedule.EndApplication,
            schedule.IsPublished,
            schedule.Remarks,
            schedule.CreatedAt
        );
    }
}
