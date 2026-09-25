using System;
using FluentValidation;

namespace EDGE.Application.Conversations.Commands.ToggleArchiveConversation;

public class ToggleArchiveConversationCommandValidator : AbstractValidator<ToggleArchiveConversationCommand>
{
    public ToggleArchiveConversationCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.");
    }
}
