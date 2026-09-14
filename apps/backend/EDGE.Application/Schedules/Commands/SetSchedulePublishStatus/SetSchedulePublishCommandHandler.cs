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
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public SetSchedulePublishCommandHandler(
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        ITenantContextService tenantContextService,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _tenantContextService = tenantContextService;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ScheduleDto?> Handle(SetSchedulePublishStatusCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return null;
        }

        var authUserId = _currentUserService.UserId;
        var user = !string.IsNullOrWhiteSpace(authUserId)
            ? await _userRepository.GetByAuthUserIdAsync(authUserId, cancellationToken)
            : null;

        if (user != null && !user.IsSuperAdmin)
        {
            var isMember = await _tenantContextService.IsUserActiveMemberAsync(schedule.TenantId, cancellationToken);
            if (!isMember)
            {
                throw new UnauthorizedAccessException("You are not authorized to publish schedules for this regional tenant.");
            }
        }

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
