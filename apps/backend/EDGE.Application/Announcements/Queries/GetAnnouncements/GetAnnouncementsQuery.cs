using MediatR;
using EDGE.Application.Announcements.DTOs;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Announcements.Queries.GetAnnouncements;

public record GetAnnouncementsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? SearchTerm = null,
    string? Type = null
) : IRequest<PaginatedApiResponse<SystemAnnouncementDto>>;
