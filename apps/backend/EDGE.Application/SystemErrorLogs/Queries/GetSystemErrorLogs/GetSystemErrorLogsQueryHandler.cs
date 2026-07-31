using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SystemErrorLogs.DTOs;

namespace EDGE.Application.SystemErrorLogs.Queries.GetSystemErrorLogs;

public class GetSystemErrorLogsQueryHandler : IRequestHandler<GetSystemErrorLogsQuery, (List<SystemErrorLogDto> Items, int TotalCount)>
{
    private readonly ISystemErrorLogRepository _repository;

    public GetSystemErrorLogsQueryHandler(ISystemErrorLogRepository repository)
    {
        _repository = repository;
    }

    public async Task<(List<SystemErrorLogDto> Items, int TotalCount)> Handle(GetSystemErrorLogsQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _repository.GetPagedErrorLogsAsync(
            request.PageNumber,
            request.PageSize,
            request.Level,
            request.SearchTerm,
            cancellationToken);

        var dtos = items.Select(l => new SystemErrorLogDto
        {
            Id = l.Id,
            Level = l.Level,
            Message = l.Message,
            ExceptionType = l.ExceptionType,
            StackTrace = l.StackTrace,
            Source = l.Source,
            RequestPath = l.RequestPath,
            HttpMethod = l.HttpMethod,
            UserEmail = l.UserEmail,
            LoggedAt = l.LoggedAt
        }).ToList();

        return (dtos, totalCount);
    }
}
