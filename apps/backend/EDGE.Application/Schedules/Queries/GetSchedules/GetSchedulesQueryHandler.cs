using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetSchedules;

public class GetSchedulesQueryHandler : IRequestHandler<GetSchedulesQuery, PaginatedApiResponse<ScheduleDto>>
{
    private readonly IScheduleRepository _scheduleRepository;

    public GetSchedulesQueryHandler(IScheduleRepository scheduleRepository)
    {
        _scheduleRepository = scheduleRepository;
    }

    public async Task<PaginatedApiResponse<ScheduleDto>> Handle(GetSchedulesQuery request, CancellationToken cancellationToken)
    {
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var (schedules, totalCount) = await _scheduleRepository.GetAllAsync(
            request.TenantId,
            request.ServiceId,
            pageNumber,
            pageSize,
            cancellationToken);

        var scheduleDtos = schedules.Select(s => new ScheduleDto(
            s.Id,
            s.ServiceId,
            s.Service?.Name,
            s.Service?.Code,
            s.TenantId,
            s.Venue,
            s.StartDate,
            s.EndDate,
            s.StartApplication,
            s.EndApplication,
            s.IsPublished,
            s.MaximumSlots,
            s.Remarks,
            s.CreatedAt
        )).ToList();

        return new PaginatedApiResponse<ScheduleDto>(scheduleDtos, pageNumber, pageSize, totalCount);
    }
}
