using System;
using FluentValidation;

namespace EDGE.Application.Conversations.Commands.RemoveParticipant;

public class RemoveConversationParticipantCommandValidator : AbstractValidator<RemoveConversationParticipantCommand>
{
    public RemoveConversationParticipantCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid Conversation ID is required.");

        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("Target user ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid target user ID is required.");
    }
}
