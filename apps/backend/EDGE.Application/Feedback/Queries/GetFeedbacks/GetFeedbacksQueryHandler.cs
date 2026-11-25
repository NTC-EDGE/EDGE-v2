using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Authorization;
using EDGE.Application.Common.Helpers;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Feedback.DTOs;

namespace EDGE.Application.Feedback.Queries.GetFeedbacks;

public class GetFeedbacksQueryHandler : IRequestHandler<GetFeedbacksQuery, List<FeedbackDto>>
{
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantContextService _tenantContextService;

    public GetFeedbacksQueryHandler(
        IFeedbackRepository feedbackRepository,
        ITenantRepository tenantRepository,
        ITenantContextService tenantContextService)
    {
        _feedbackRepository = feedbackRepository;
        _tenantRepository = tenantRepository;
        _tenantContextService = tenantContextService;
    }

    public async Task<List<FeedbackDto>> Handle(GetFeedbacksQuery request, CancellationToken cancellationToken)
    {
        var allTenants = await _tenantRepository.GetAllAsync(cancellationToken);
        var tenantMap = allTenants.ToDictionary(t => t.Id, t => t);

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);
        var activeTenantIds = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
        var hasGlobalTenantAccess = isSuperAdmin || activeTenantIds.Count == 0 || activeTenantIds.Count >= allTenants.Count;

        var items = await _feedbackRepository.GetAllAsync(cancellationToken);
        var effectiveTenantId = (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
            ? request.TenantId
            : _tenantContextService.TenantId;

        if (effectiveTenantId.HasValue && effectiveTenantId.Value != Guid.Empty)
        {
            items = items
                .Where(f => f.TenantId == effectiveTenantId.Value)
                .ToList();
        }
        else if (!hasGlobalTenantAccess)
        {
            var allowedSet = activeTenantIds.ToHashSet();
            var headerTenantId = _tenantContextService.TenantId;
            if (headerTenantId.HasValue && headerTenantId.Value != Guid.Empty && allowedSet.Contains(headerTenantId.Value))
            {
                items = items
                    .Where(f => f.TenantId == headerTenantId.Value || f.TenantId == null)
                    .ToList();
            }
            else
            {
                items = items
                    .Where(f => !f.TenantId.HasValue || allowedSet.Contains(f.TenantId.Value))
                    .ToList();
            }
        }

        return items
            .OrderByDescending(f => f.CreatedAt)
            .Select(f =>
            {
                var matchedTenant = f.TenantId.HasValue && tenantMap.TryGetValue(f.TenantId.Value, out var t)
                    ? t
                    : null;

                return new FeedbackDto
                {
                    Id = f.Id,
                    TenantId = f.TenantId,
                    TenantName = matchedTenant?.Name ?? "NTC Central / General Office",
                    TenantCode = matchedTenant?.Code ?? "NTC",
                    SenderName = f.IsAnonymous ? IdentityMasker.MaskName(f.SenderName) : f.SenderName,
                    SenderEmail = f.IsAnonymous ? IdentityMasker.MaskEmail(f.SenderEmail) : f.SenderEmail,
                    Subject = f.Subject,
                    Message = f.Message,
                    Rating = f.Rating,
                    Status = f.Status,
                    IsAnonymous = f.IsAnonymous,
                    CreatedAt = f.CreatedAt
                };
            }).ToList();
    }
}

