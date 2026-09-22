using System;
using FluentValidation;

namespace EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;

public class RemoveMeetingParticipantCommandValidator : AbstractValidator<RemoveMeetingParticipantCommand>
{
    public RemoveMeetingParticipantCommandValidator()
    {
        RuleFor(x => x.MeetingCode)
            .NotEmpty().WithMessage("Meeting code is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Target user ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid target user ID is required.");
    }
}
