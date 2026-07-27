using System.Collections.Generic;
using MediatR;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Queries.GetAnnouncements;

public record GetAnnouncementsQuery : IRequest<List<SystemAnnouncementDto>>;
