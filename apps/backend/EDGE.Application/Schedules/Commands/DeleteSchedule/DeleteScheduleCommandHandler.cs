using MediatR;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Schedules.Commands.DeleteSchedule;

public class DeleteScheduleCommandHandler : IRequestHandler<DeleteScheduleCommand, bool>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteScheduleCommandHandler(IScheduleRepository scheduleRepository, IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.Id, cancellationToken);
        if (schedule is null)
        {
            return false;
        }

        _scheduleRepository.Delete(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
