using System;
using FluentValidation;

namespace EDGE.Application.Conversations.Commands.AddParticipants;

public class AddConversationParticipantsCommandValidator : AbstractValidator<AddConversationParticipantsCommand>
{
    public AddConversationParticipantsCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.")
            .NotEqual(Guid.Empty).WithMessage("Valid Conversation ID is required.");

        RuleFor(x => x.UserIds)
            .NotNull().WithMessage("User IDs list cannot be null.")
            .Must(x => x != null && x.Count > 0).WithMessage("At least one user must be selected.");
    }
}
