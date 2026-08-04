using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Queries.GetAnnouncements;

public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, PaginatedApiResponse<SystemAnnouncementDto>>
{
    private readonly ISystemAnnouncementRepository _repository;

    public GetAnnouncementsQueryHandler(ISystemAnnouncementRepository repository)
    {
        _repository = repository;
    }

    public async Task<PaginatedApiResponse<SystemAnnouncementDto>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        
        var filteredable = items.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.Trim().ToLower();
            filteredable = filteredable.Where(a => a.Title.ToLower().Contains(term) || a.Message.ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(request.Type) && request.Type != "ALL")
        {
            filteredable = filteredable.Where(a => a.Type.Equals(request.Type, StringComparison.OrdinalIgnoreCase));
        }

        var totalCount = filteredable.Count();
        var pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var paginated = filteredable
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new SystemAnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Message = a.Message,
                Type = a.Type,
                IsActive = a.IsActive,
                StartDate = a.StartDate,
                EndDate = a.EndDate,
                TargetAudience = a.TargetAudience,
                CreatedAt = a.CreatedAt
            })
            .ToList();

        return new PaginatedApiResponse<SystemAnnouncementDto>(paginated, pageNumber, pageSize, totalCount);
    }
}
