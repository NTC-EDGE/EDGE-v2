using FluentValidation;

namespace EDGE.Application.Announcements.Commands.TogglePublishAnnouncement;

public class TogglePublishAnnouncementCommandValidator : AbstractValidator<TogglePublishAnnouncementCommand>
{
    public TogglePublishAnnouncementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Announcement ID is required.");
    }
}
