using System;
using MediatR;
using EDGE.Application.Announcements.DTOs;

namespace EDGE.Application.Announcements.Commands.UpdateAnnouncement;

public record UpdateAnnouncementCommand(
    Guid Id,
    string Title,
    string Message,
    string Type,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate,
    string TargetAudience
) : IRequest<SystemAnnouncementDto?>;
