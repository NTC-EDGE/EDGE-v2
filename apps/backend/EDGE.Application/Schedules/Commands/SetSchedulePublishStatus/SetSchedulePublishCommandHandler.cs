using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Commands.SetSchedulePublishStatus;

public class SetSchedulePublishCommandHandler : IRequestHandler<SetSchedulePublishStatusCommand, ScheduleDto?>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService _tenantContextService;

    public SetSchedulePublishCommandHandler(
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        ITenantContextService tenantContextService)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _tenantContextService = tenantContextService;
    }

    public async Task<ScheduleDto?> Handle(SetSchedulePublishStatusCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        await _tenantContextService.EnsureUserActiveMemberAsync(
            schedule.TenantId,
            "You are not authorized to publish schedules for this regional tenant.",
            cancellationToken);

        var newPublishStatus = request.IsPublished ?? !schedule.IsPublished;
        if (newPublishStatus && (schedule.StartApplication == null || schedule.EndApplication == null))
        {
            throw new FluentValidation.ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure("IsPublished", "Please set the Start Application and End Application dates before publishing the schedule.")
            });
        }

        schedule.IsPublished = newPublishStatus;

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
}
