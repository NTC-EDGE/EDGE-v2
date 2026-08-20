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

    public GetAllApplicationsQueryHandler(
        IApplicationFullRepository repository,
        ICurrentUserService currentUserService,
        IUserRepository userRepository,
        IUserAuthorizationService authService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
        _authService = authService;
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
