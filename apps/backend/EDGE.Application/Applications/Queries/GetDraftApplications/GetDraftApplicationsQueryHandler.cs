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

public class GetDraftApplicationsQueryHandler : IRequestHandler<GetDraftApplicationsQuery, DraftApplicationsEnvelope>
{
    private readonly IApplicationFullRepository _repository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUserRepository _userRepository;

    public GetDraftApplicationsQueryHandler(
        IApplicationFullRepository repository,
        ICurrentUserService currentUserService,
        IUserRepository userRepository)
    {
        _repository = repository;
        _currentUserService = currentUserService;
        _userRepository = userRepository;
    }

    public async Task<DraftApplicationsEnvelope> Handle(GetDraftApplicationsQuery request, CancellationToken cancellationToken)
    {
        var userIdStr = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userIdStr))
        {
            return DraftApplicationsEnvelope.Fail("401 Unauthorized: Only authenticated users can retrieve saved drafts.");
        }

        var candidateUserIds = new List<Guid>();
        if (Guid.TryParse(userIdStr, out var parsedGuid))
        {
            candidateUserIds.Add(parsedGuid);
            var dbUser = await _userRepository.GetByIdAsync(parsedGuid, cancellationToken)
                         ?? await _userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
            if (dbUser != null && !candidateUserIds.Contains(dbUser.Id))
            {
                candidateUserIds.Add(dbUser.Id);
            }
        }
        else
        {
            var dbUser = await _userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
            if (dbUser != null)
            {
                candidateUserIds.Add(dbUser.Id);
            }
            else
            {
                candidateUserIds.Add(CreateGuidFromString(userIdStr));
            }
        }

        var drafts = await _repository.GetUserDraftsAsync(candidateUserIds, cancellationToken);

        // Parse category filter if provided
        Guid? filterCategoryId = request.CategoryId;
        string? filterCategoryParam = request.CategoryParam?.Trim();

        if (!string.IsNullOrEmpty(filterCategoryParam))
        {
            if (filterCategoryParam.StartsWith("categoryId=", StringComparison.OrdinalIgnoreCase))
            {
                filterCategoryParam = filterCategoryParam.Substring("categoryId=".Length).Trim();
            }

            if (Guid.TryParse(filterCategoryParam, out var parsedCategoryGuid))
            {
                filterCategoryId = parsedCategoryGuid;
                filterCategoryParam = null;
            }
        }

        bool hasCategoryFilter = (filterCategoryId.HasValue && filterCategoryId.Value != Guid.Empty) ||
                                 (!string.IsNullOrEmpty(filterCategoryParam) && !filterCategoryParam.Equals("ALL", StringComparison.OrdinalIgnoreCase));

        if (!hasCategoryFilter)
        {
            // Return aggregated summary of draft counts per category
            var summaryList = drafts
                .Select(app =>
                {
                    var firstApplicant = app.ApplicationApplicants.FirstOrDefault()?.Applicant;
                    var firstService = firstApplicant?.Service;
                    var firstCategory = firstService?.ServiceCategory;
                    return new
                    {
                        CategoryId = firstCategory?.Id ?? Guid.Empty,
                        CategoryName = firstCategory?.Name ?? "Uncategorized",
                        CategoryCode = firstCategory?.Code ?? ""
                    };
                })
                .Where(x => x.CategoryId != Guid.Empty)
                .GroupBy(x => new { x.CategoryId, x.CategoryName, x.CategoryCode })
                .Select(g => new DraftCategorySummaryDto
                {
                    ServiceCategoryId = g.Key.CategoryId,
                    ServiceCategoryName = g.Key.CategoryName,
                    ServiceCategoryCode = g.Key.CategoryCode,
                    DraftCount = g.Count()
                })
                .ToList();

            return DraftApplicationsEnvelope.SuccessSummaries(summaryList, "User draft applications retrieved successfully.");
        }

        // Filter drafts for specific category
        var filteredDrafts = drafts.Where(app =>
        {
            var firstApplicant = app.ApplicationApplicants.FirstOrDefault()?.Applicant;
            var cat = firstApplicant?.Service?.ServiceCategory;

            if (filterCategoryId.HasValue && filterCategoryId.Value != Guid.Empty)
            {
                return cat?.Id == filterCategoryId.Value;
            }

            if (!string.IsNullOrEmpty(filterCategoryParam))
            {
                if (cat?.Code != null && cat.Code.Equals(filterCategoryParam, StringComparison.OrdinalIgnoreCase))
                    return true;
                if (cat?.Name != null && cat.Name.IndexOf(filterCategoryParam, StringComparison.OrdinalIgnoreCase) >= 0)
                    return true;
                if (cat?.Type.ToString() != null && cat.Type.ToString().IndexOf(filterCategoryParam, StringComparison.OrdinalIgnoreCase) >= 0)
                    return true;
            }

            return false;
        }).ToList();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim();
            filteredDrafts = filteredDrafts.Where(app =>
            {
                var sName = app.ApplicationApplicants.FirstOrDefault()?.Applicant?.Service?.Name ?? "";
                var refNo = app.ReferenceNumber ?? "";
                var appNo = app.ApplicationNumber ?? "";
                return sName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                       refNo.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                       appNo.Contains(term, StringComparison.OrdinalIgnoreCase);
            }).ToList();
        }

        var totalCount = filteredDrafts.Count;
        var pageNumber = request.PageNumber > 0 ? request.PageNumber : 1;
        var pageSize = request.PageSize > 0 ? request.PageSize : 10;

        var pagedDrafts = filteredDrafts
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var items = pagedDrafts.Select(app =>
        {
            var firstApplicant = app.ApplicationApplicants.FirstOrDefault()?.Applicant;
            var firstService = firstApplicant?.Service;
            var firstCategory = firstService?.ServiceCategory;
            var variant = firstApplicant?.ServiceVariant?.Description ?? firstApplicant?.ServiceVariant?.Type.ToString() ?? "";
            
            var element = app.FormSubmissions
                .SelectMany(fs => fs.FieldValues)
                .FirstOrDefault(fv => fv.Field != null && (
                    fv.Field.Label.ToLower().Contains("element") ||
                    fv.Field.Label.ToLower().Contains("class option") ||
                    fv.Field.Label.ToLower().Contains("type of certificate")
                ))?.Value ?? "";

            return new DraftApplicationItemDto
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
                CreatedAt = app.CreatedAt,
                ServiceId = firstService?.Id,
                ServiceName = firstService?.Name,
                ServiceCategoryId = firstCategory?.Id,
                ServiceCategoryName = firstCategory?.Name,
                ServiceCategoryCode = firstCategory?.Code,
                ServiceVariant = variant,
                ServiceVariantElement = element
            };
        }).ToList();

        return DraftApplicationsEnvelope.SuccessPaged(items, pageNumber, pageSize, totalCount, "User draft applications retrieved successfully.");
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
