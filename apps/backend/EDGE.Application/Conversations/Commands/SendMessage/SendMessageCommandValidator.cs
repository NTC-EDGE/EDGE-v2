using FluentValidation;

namespace EDGE.Application.Conversations.Commands.SendMessage;

public class SendMessageCommandValidator : AbstractValidator<SendMessageCommand>
{
    public SendMessageCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("Conversation ID is required.");

        RuleFor(x => x.Content)
            .NotEmpty().When(x => x.Attachments == null || x.Attachments.Count == 0)
            .WithMessage("Message content or attachment is required.");
    }
}
