using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.CreateSchedule;

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, ScheduleDto>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ScheduleDto> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new InvalidOperationException($"Service with ID '{request.ServiceId}' does not exist.");
        }

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
            MaximumSlots = request.MaximumSlots,
            Remarks = request.Remarks
        };

        await _scheduleRepository.AddAsync(schedule, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ScheduleDto(
            schedule.Id,
            schedule.ServiceId,
            service.Name,
            service.Code,
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
}
