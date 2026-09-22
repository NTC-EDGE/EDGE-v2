using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applicants.Dtos;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

using EDGE.Domain.Authorization;

namespace EDGE.Application.Applications.Queries.GetAllApplications;

public class GetAllApplicationsQueryHandler : IRequestHandler<GetAllApplicationsQuery, ApiResponse<PagedApplicationListDto>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;
    private readonly IUserAuthorizationService _authService;
    private readonly ITenantContextService _tenantContextService;

    public GetAllApplicationsQueryHandler(
        IApplicationFullRepository repository,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IUserAuthorizationService authService,
        ITenantContextService tenantContextService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _authService = authService;
        _tenantContextService = tenantContextService;
    }

    public async Task<ApiResponse<PagedApplicationListDto>> Handle(GetAllApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<PagedApplicationListDto>.Fail("401 Unauthorized: User authentication context missing.");
        }

        Guid? resolvedUserId = null;
        string? resolvedEmail = null;
        if (Guid.TryParse(userIdStr, out var parsedGuid))
        {
            resolvedUserId = parsedGuid;
        }
        else
        {
            var dbUser = await _userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
            if (dbUser != null)
            {
                resolvedUserId = dbUser.Id;
                resolvedEmail = dbUser.Email;
            }
            else
            {
                resolvedUserId = CreateGuidFromString(userIdStr);
            }
        }

        // Determine whether to filter strictly by the logged-in user:
        bool shouldFilterByMine = string.Equals(request.Scope, "mine", StringComparison.OrdinalIgnoreCase);

        if (!shouldFilterByMine)
        {
            bool isStaff = !string.IsNullOrEmpty(request.QueueTab) ||
                           !string.IsNullOrEmpty(request.Scope) ||
                           await _authService.HasAnyPermissionAsync(new[]
                           {
                               Permissions.ViewAllApplications,
                               Permissions.EvaluateApplication,
                               Permissions.ApproveApplication,
                               Permissions.CreateBilling,
                               Permissions.ApproveSoa,
                               Permissions.CollectPayment
                           }, cancellationToken);

            shouldFilterByMine = !isStaff;
        }

        Guid? filterUserId = shouldFilterByMine ? resolvedUserId : null;
        string? filterEmail = shouldFilterByMine ? resolvedEmail : null;

        Guid? filterTenantId = null;
        List<Guid>? filterTenantIds = null;

        var isSuperAdmin = await _tenantContextService.IsCurrentUserSuperAdminAsync(cancellationToken);
        if (shouldFilterByMine)
        {
            if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
            {
                filterTenantId = request.TenantId.Value;
            }
        }
        else if (!isSuperAdmin)
        {
            if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberAsync(request.TenantId.Value, cancellationToken);
                if (!isMember)
                {
                    return ApiResponse<PagedApplicationListDto>.Success(new PagedApplicationListDto(), "No applications found for specified tenant.");
                }
                filterTenantId = request.TenantId.Value;
            }
            else if (_tenantContextService.TenantId.HasValue && _tenantContextService.TenantId.Value != Guid.Empty)
            {
                var isMember = await _tenantContextService.IsUserActiveMemberOfCurrentTenantAsync(cancellationToken);
                if (isMember)
                {
                    filterTenantId = _tenantContextService.TenantId.Value;
                }
                else
                {
                    return ApiResponse<PagedApplicationListDto>.Success(new PagedApplicationListDto(), "No applications found for tenant context.");
                }
            }
            else
            {
                var activeTenantIds = await _tenantContextService.GetUserActiveTenantIdsAsync(cancellationToken);
                if (activeTenantIds.Count > 0)
                {
                    filterTenantIds = activeTenantIds;
                }
            }
        }
        else if (request.TenantId.HasValue && request.TenantId.Value != Guid.Empty)
        {
            filterTenantId = request.TenantId.Value;
        }

        var pagedResult = await _repository.GetPagedApplicationSummaryDtosAsync(
            request.Status,
            request.QueueTab,
            request.Scope,
            filterUserId,
            filterEmail,
            request.PageNumber ?? 1,
            request.PageSize ?? 10,
            request.SearchTerm,
            request.Mode,
            filterTenantId,
            filterTenantIds,
            cancellationToken);

        return ApiResponse<PagedApplicationListDto>.Success(pagedResult, "User applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
