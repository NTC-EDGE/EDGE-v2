using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Applications.Queries.GetMyApplications;

public class GetMyApplicationsQueryHandler : IRequestHandler<GetMyApplicationsQuery, ApiResponse<PagedApplicationListDto>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GetMyApplicationsQueryHandler(
        IApplicationFullRepository repository,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse<PagedApplicationListDto>> Handle(GetMyApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;

        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<PagedApplicationListDto>.Fail("401: Unauthorized. User must be authenticated to view their applications.");
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

        var pagedResult = await _repository.GetPagedApplicationSummaryDtosAsync(
            status: request.Status,
            queueTab: null,
            scope: null,
            userId: resolvedUserId,
            userEmail: resolvedEmail,
            pageNumber: request.PageNumber ?? 1,
            pageSize: request.PageSize ?? 10,
            searchTerm: request.SearchTerm,
            mode: request.Mode,
            cancellationToken: cancellationToken);

        return ApiResponse<PagedApplicationListDto>.Success(pagedResult, "User applications and statistics retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
