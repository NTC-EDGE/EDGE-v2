using FluentValidation;

namespace EDGE.Application.Meetings.Commands.InviteMeetingParticipants;

public class InviteMeetingParticipantsCommandValidator : AbstractValidator<InviteMeetingParticipantsCommand>
{
    public InviteMeetingParticipantsCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.UserIds)
            .NotNull().WithMessage("User IDs list cannot be null.")
            .Must(x => x != null && x.Count > 0).WithMessage("At least one user must be selected for invitation.");
    }
}
