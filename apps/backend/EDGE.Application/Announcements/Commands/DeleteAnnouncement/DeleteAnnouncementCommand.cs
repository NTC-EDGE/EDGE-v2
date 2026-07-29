using System;
using MediatR;

namespace EDGE.Application.Announcements.Commands.DeleteAnnouncement;

public record DeleteAnnouncementCommand(Guid Id) : IRequest<bool>;
