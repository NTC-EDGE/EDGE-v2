using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Helpers;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Commands.SubmitFeedback;

public class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, FeedbackDto>
{
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContextService _tenantContextService;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitFeedbackCommandHandler(
        IFeedbackRepository feedbackRepository,
        ITenantRepository tenantRepository,
        ITenantContextService tenantContextService,
        IUnitOfWork unitOfWork)
    {
        _feedbackRepository = feedbackRepository;
        _tenantRepository = tenantRepository;
        _tenantContextService = tenantContextService;
        _unitOfWork = unitOfWork;
    }

    public async Task<FeedbackDto> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var rawName = (request.SenderName ?? string.Empty).Trim();
        var rawEmail = (request.SenderEmail ?? string.Empty).Trim();

        var resolvedTenantId = request.TenantId ?? _tenantContextService.TenantId;
        Tenant? targetTenant = null;

        if (resolvedTenantId.HasValue && resolvedTenantId.Value != Guid.Empty)
        {
            targetTenant = await _tenantRepository.GetByIdAsync(resolvedTenantId.Value, cancellationToken);
        }

        if (targetTenant == null)
        {
            var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
            targetTenant = allTenants
                .Where(t => t.IsActive && !t.IsDeleted)
                .OrderBy(t => t.Code.Contains("NCR", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
                .ThenBy(t => t.Code)
                .FirstOrDefault();
            resolvedTenantId = targetTenant?.Id;
        }

        var feedback = new EDGE.Domain.Entities.Feedback
        {
            TenantId = resolvedTenantId,
            SenderName = request.IsAnonymous || string.IsNullOrWhiteSpace(rawName) ? "Anonymous User" : rawName,
            SenderEmail = request.IsAnonymous || string.IsNullOrWhiteSpace(rawEmail) ? "anonymous@hidden.local" : rawEmail,
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            Rating = request.Rating,
            Status = "Pending",
            IsAnonymous = request.IsAnonymous
        };

        await _feedbackRepository.AddAsync(feedback, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new FeedbackDto
        {
            Id = feedback.Id,
            TenantId = feedback.TenantId,
            TenantName = targetTenant?.Name,
            TenantCode = targetTenant?.Code,
            SenderName = feedback.IsAnonymous ? IdentityMasker.MaskName(feedback.SenderName) : feedback.SenderName,
            SenderEmail = feedback.IsAnonymous ? IdentityMasker.MaskEmail(feedback.SenderEmail) : feedback.SenderEmail,
            Subject = feedback.Subject,
            Message = feedback.Message,
            Rating = feedback.Rating,
            Status = feedback.Status,
            IsAnonymous = feedback.IsAnonymous,
            CreatedAt = feedback.CreatedAt
        };
    }
}

