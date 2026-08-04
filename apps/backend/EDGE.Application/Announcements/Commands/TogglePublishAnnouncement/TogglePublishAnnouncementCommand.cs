using System;
using MediatR;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Commands.TogglePublishAnnouncement;

public record TogglePublishAnnouncementCommand(
    Guid Id,
    bool IsActive
) : IRequest<SystemAnnouncementDto?>;
