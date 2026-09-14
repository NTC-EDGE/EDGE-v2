using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, bool>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITenantContextService _tenantContextService;

    public DeleteScheduleCommandHandler(
        IScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork,
        ITenantContextService tenantContextService)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
        _tenantContextService = tenantContextService;
    }

    public async Task<bool> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return false;
        }

        await _tenantContextService.EnsureUserActiveMemberAsync(
            schedule.TenantId,
            "You are not authorized to delete schedules for this regional tenant.",
            cancellationToken);

        if (schedule.IsPublished)
        {
            throw new InvalidOperationException("Published schedules cannot be deleted. Please unpublish the schedule to draft status before deleting.");
        }

        _scheduleRepository.Delete(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
