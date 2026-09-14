using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, bool>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService _tenantContextService;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public DeleteScheduleCommandHandler(
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

    public async Task<bool> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return false;
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
                throw new UnauthorizedAccessException("You are not authorized to delete schedules for this regional tenant.");
            }
        }

        if (schedule.IsPublished)
        {
            throw new InvalidOperationException("Published schedules cannot be deleted. Please unpublish the schedule to draft status before deleting.");
        }

        _scheduleRepository.Delete(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
