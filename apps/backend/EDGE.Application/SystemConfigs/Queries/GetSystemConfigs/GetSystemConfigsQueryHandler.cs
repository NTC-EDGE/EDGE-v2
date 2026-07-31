using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.SystemConfigs.DTOs;

namespace EDGE.Application.SystemConfigs.Queries.GetSystemConfigs;

public class GetSystemConfigsQueryHandler : IRequestHandler<GetSystemConfigsQuery, PaginatedApiResponse<SystemConfigDto>>
{
    private readonly ISystemConfigRepository _repository;

    public GetSystemConfigsQueryHandler(ISystemConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<SystemConfigDto>> Handle(GetSystemConfigsQuery request, CancellationToken cancellationToken)
    {
        var configs = request.PublicOnly
            ? await _repository.GetPublicConfigsAsync(cancellationToken)
            : !string.IsNullOrWhiteSpace(request.Category) && request.Category != "ALL"
                ? await _repository.GetByCategoryAsync(request.Category, cancellationToken)
                : await _repository.GetAllAsync(cancellationToken);

        var queryable = configs.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            queryable = queryable.Where(c =>
                c.Key.ToLower().Contains(term) ||
                c.Value.ToLower().Contains(term) ||
                (c.Description != null && c.Description.ToLower().Contains(term)) ||
                c.Category.ToLower().Contains(term)
            );
        }

        var totalCount = queryable.Count();
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var paginated = queryable
            .OrderBy(c => c.Category).ThenBy(c => c.Key)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new SystemConfigDto
            {
                Id = c.Id,
                Category = c.Category,
                Key = c.Key,
                Value = c.Value,
                Description = c.Description,
                DataType = c.DataType,
                IsPublic = c.IsPublic,
                LastModifiedAt = c.LastModifiedAt
            })
            .ToList();

        return new PaginatedApiResponse<SystemConfigDto>(paginated, pageNumber, pageSize, totalCount);
    }
}
