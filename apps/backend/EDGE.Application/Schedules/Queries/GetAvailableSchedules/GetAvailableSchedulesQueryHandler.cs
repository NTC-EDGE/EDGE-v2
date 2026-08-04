using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Schedules.DTOs;

namespace EDGE.Application.Schedules.Queries.GetAvailableSchedules;

public class GetAvailableSchedulesQueryHandler : IRequestHandler<GetAvailableSchedulesQuery, PaginatedApiResponse<ClientScheduleDto>>
{
    private readonly IScheduleRepository _scheduleRepository;
    private readonly ITenantRepository _tenantRepository;
    private readonly IServiceRepository _serviceRepository;

    public GetAvailableSchedulesQueryHandler(
        IScheduleRepository scheduleRepository,
        ITenantRepository tenantRepository,
        IServiceRepository serviceRepository)
    {
        _scheduleRepository = scheduleRepository;
        _tenantRepository = tenantRepository;
        _serviceRepository = serviceRepository;
    }

    public async Task<PaginatedApiResponse<ClientScheduleDto>> Handle(GetAvailableSchedulesQuery request, CancellationToken cancellationToken)
    {
        // 1. Verify tenant exists
        var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
        if (tenant == null)
        {
            throw new KeyNotFoundException($"Tenant with ID '{request.TenantId}' was not found.");
        }

        // 2. Verify service exists
        var service = await _serviceRepository.GetByIdAsync(request.ServiceId, cancellationToken);
        if (service == null)
        {
            throw new KeyNotFoundException($"Service with ID '{request.ServiceId}' was not found.");
        }

        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var (schedules, totalCount) = await _scheduleRepository.GetAvailableSchedulesAsync(
            request.ServiceId,
            request.TenantId,
            request.Date,
            pageNumber,
            pageSize,
            cancellationToken
        );

        var clientScheduleDtos = schedules.Select(s => new ClientScheduleDto(
            s.Id,
            s.ServiceId,
            s.TenantId,
            s.Venue,
            s.StartDate,
            s.EndDate,
            s.StartApplication,
            s.EndApplication,
            s.IsPublished,
            s.MaximumSlots,
            s.Remarks
        )).ToList();

        return new PaginatedApiResponse<ClientScheduleDto>(clientScheduleDtos, pageNumber, pageSize, totalCount);
    }
}
