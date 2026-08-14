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

namespace EDGE.Application.Applications.Queries.GetDraftApplications;

public class GetDraftApplicationsQueryHandler : IRequestHandler<GetDraftApplicationsQuery, ApiResponse<List<ApplicationDto>>>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetDraftApplicationsQueryHandler(IApplicationFullRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<ApiResponse<List<ApplicationDto>>> Handle(GetDraftApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return ApiResponse<List<ApplicationDto>>.Fail("401 Unauthorized: Only authenticated users can retrieve saved drafts.");
        }

        Guid userId = Guid.TryParse(userIdStr, out var parsed) ? parsed : CreateGuidFromString(userIdStr);
        var drafts = await _repository.GetUserDraftsAsync(userId, cancellationToken);

        var dtos = drafts.Select(app => new ApplicationDto
        {
            Id = app.Id,
            TenantId = app.TenantId,
            ScheduleId = app.ScheduleId,
            RegionId = app.RegionId,
            Office = app.Office,
            ApplicationNumber = app.ApplicationNumber,
            ReferenceNumber = app.ReferenceNumber,
            Status = app.Status.ToString(),
            SubmissionMode = app.SubmissionMode.ToString(),
            DataEntryMethod = app.DataEntryMethod?.ToString(),
            Remarks = app.Remarks,
            UserId = app.UserId,
            IsGuest = app.IsGuest,
            CreatedAt = app.CreatedAt
        }).ToList();

        return ApiResponse<List<ApplicationDto>>.Success(dtos, "User draft applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
