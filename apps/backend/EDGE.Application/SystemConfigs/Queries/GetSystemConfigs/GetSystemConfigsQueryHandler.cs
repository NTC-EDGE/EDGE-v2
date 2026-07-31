using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SystemConfigs.DTOs;

namespace EDGE.Application.SystemConfigs.Queries.GetSystemConfigs;

public class GetSystemConfigsQueryHandler : IRequestHandler<GetSystemConfigsQuery, List<SystemConfigDto>>
{
    private readonly ISystemConfigRepository _repository;

    public GetSystemConfigsQueryHandler(ISystemConfigRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<SystemConfigDto>> Handle(GetSystemConfigsQuery request, CancellationToken cancellationToken)
    {
        var configs = request.PublicOnly
            ? await _repository.GetPublicConfigsAsync(cancellationToken)
            : !string.IsNullOrWhiteSpace(request.Category)
                ? await _repository.GetByCategoryAsync(request.Category, cancellationToken)
                : await _repository.GetAllAsync(cancellationToken);

        return configs.Select(c => new SystemConfigDto
        {
            Id = c.Id,
            Category = c.Category,
            Key = c.Key,
            Value = c.Value,
            Description = c.Description,
            DataType = c.DataType,
            IsPublic = c.IsPublic,
            LastModifiedAt = c.LastModifiedAt
        }).ToList();
    }
}
