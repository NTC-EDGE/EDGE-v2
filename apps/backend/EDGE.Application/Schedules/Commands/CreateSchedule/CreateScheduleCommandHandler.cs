using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.CreateSchedule;

public class CreateScheduleCommandHandler : IRequestHandler<CreateScheduleCommand, ScheduleDto>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IServiceRepository _serviceRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService _tenantContextService;

    public CreateScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IServiceRepository serviceRepository,
        IUnitOfWork unitOfWork,
        ITenantContextService tenantContextService)
    {
        _scheduleRepository = scheduleRepository;
        _serviceRepository = serviceRepository;
        _unitOfWork = unitOfWork;
        _tenantContextService = tenantContextService;
    }

    public async Task<ScheduleDto> Handle(CreateScheduleCommand request, CancellationToken cancellationToken)
    {
        await _tenantContextService.EnsureUserActiveMemberAsync(
            request.TenantId,
            "You are not authorized to create schedules for this regional tenant.",
            cancellationToken);
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new InvalidOperationException($"Service with ID '{request.ServiceId}' does not exist.");
        }

        if (service.ServiceCategory?.Type != EDGE.Domain.Enums.ServiceCategoryType.Exam)
        {
            throw new InvalidOperationException("Schedules can only be created for Examination services.");
        }

        var schedule = new Schedule
        {
            ServiceId = request.ServiceId,
            TenantId = request.TenantId,
            Venue = request.Venue,
            StartDate = ToUtc(request.StartDate),
            EndDate = ToUtc(request.EndDate),
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            StartApplication = ToUtc(request.StartApplication),
            EndApplication = ToUtc(request.EndApplication),
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
            schedule.CreatedAt,
            schedule.StartTime,
            schedule.EndTime
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
