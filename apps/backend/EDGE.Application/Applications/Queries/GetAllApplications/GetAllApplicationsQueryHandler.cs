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

namespace EDGE.Application.Applications.Queries.GetAllApplications;

public class GetAllApplicationsQueryHandler : IRequestHandler<GetAllApplicationsQuery, ApiResponse<List<ApplicationDto>>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetAllApplicationsQueryHandler(IApplicationFullRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<ApplicationDto>>> Handle(GetAllApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<List<ApplicationDto>>.Fail("401 Unauthorized: Only authenticated users can retrieve applications.");
        }

        var dtos = await _repository.GetApplicationDtosAsync(request.Status, request.QueueTab, request.Scope, cancellationToken);

        return ApiResponse<List<ApplicationDto>>.Success(dtos, "User applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
