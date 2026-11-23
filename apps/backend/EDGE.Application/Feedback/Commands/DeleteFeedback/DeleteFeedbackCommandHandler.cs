using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Interfaces;

namespace EDGE.Application.Feedback.Commands.DeleteFeedback;

public class DeleteFeedbackCommandHandler : IRequestHandler<DeleteFeedbackCommand, bool>
{
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteFeedbackCommandHandler(
        IFeedbackRepository feedbackRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _feedbackRepository = feedbackRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(DeleteFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _feedbackRepository.GetByIdAsync(request.Id, cancellationToken);
        if (feedback == null) return false;

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);
        if (!isSuperAdmin && feedback.TenantId.HasValue)
        {
            var activeTenantIds = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
            if (activeTenantIds.Count > 0 && !activeTenantIds.Contains(feedback.TenantId.Value))
            {
                await _tenantContextService.EnsureUserActiveMemberAsync(
                    feedback.TenantId.Value,
                    "You are not authorized to delete feedback belonging to another Regional Office.",
                    cancellationToken);
            }
        }

        _feedbackRepository.Delete(feedback);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}

