using FluentValidation;

namespace EDGE.Application.Announcements.Commands.DeleteAnnouncement;

public class DeleteAnnouncementCommandValidator : AbstractValidator<DeleteAnnouncementCommand>
{
    public DeleteAnnouncementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Announcement ID is required.");
    }
}
