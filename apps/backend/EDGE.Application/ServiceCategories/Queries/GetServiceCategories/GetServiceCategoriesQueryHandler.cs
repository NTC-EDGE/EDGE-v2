using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceCategories.Dtos;

namespace EDGE.Application.ServiceCategories.Queries.GetServiceCategories;

public class GetServiceCategoriesQueryHandler(
    IServiceCategoryRepository repository,
    IApplicationFullRepository applicationRepository,
    ICurrentUserService currentUserService,
    IUserRepository userRepository)
    : IRequestHandler<GetServiceCategoriesQuery, ApiResponse<List<ServiceCategoryDto>>>
{
    public async Task<ApiResponse<List<ServiceCategoryDto>>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await repository.GetAllAsync(cancellationToken);
        var counts = await repository.GetServiceCountsAsync(cancellationToken);

        // Compute draft counts per category for the current user
        Dictionary<Guid, int> draftCounts = new();
        var userIdStr = currentUserService.UserId;
        if (!string.IsNullOrEmpty(userIdStr))
        {
            var candidateUserIds = new List<Guid>();
            if (Guid.TryParse(userIdStr, out var parsedGuid))
            {
                candidateUserIds.Add(parsedGuid);
                var dbUser = await userRepository.GetByIdAsync(parsedGuid, cancellationToken)
                             ?? await userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
                if (dbUser != null && !candidateUserIds.Contains(dbUser.Id))
                {
                    candidateUserIds.Add(dbUser.Id);
                }
            }
            else
            {
                var dbUser = await userRepository.GetByAuthUserIdAsync(userIdStr, cancellationToken);
                if (dbUser != null)
                {
                    candidateUserIds.Add(dbUser.Id);
                }
                else
                {
                    candidateUserIds.Add(CreateGuidFromString(userIdStr));
                }
            }

            var drafts = await applicationRepository.GetUserDraftsAsync(candidateUserIds, cancellationToken);
            foreach (var d in drafts)
            {
                var catId = d.ApplicationApplicants
                    .Select(aa => aa.Applicant?.Service?.ServiceCategoryId)
                    .FirstOrDefault(c => c.HasValue);
                if (catId.HasValue)
                {
                    draftCounts[catId.Value] = draftCounts.TryGetValue(catId.Value, out var c) ? c + 1 : 1;
                }
            }
        }

        var dtos = categories.Select(r => new ServiceCategoryDto(
            r.Id,
            r.Name,
            r.Code,
            r.Type.ToString(),
            counts.TryGetValue(r.Id, out var count) ? count : 0,
            draftCounts.TryGetValue(r.Id, out var dCount) ? dCount : 0
        )).ToList();

        return ApiResponse<List<ServiceCategoryDto>>.Success(dtos);
    }

    private static Guid CreateGuidFromString(string input)
    {
        using var md5 = MD5.Create();
        byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }
}
