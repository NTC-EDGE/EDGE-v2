using FluentValidation;
using EDGE.Domain.Enums;

namespace EDGE.Application.Conversations.Commands.CreateConversation;

public class CreateConversationCommandValidator : AbstractValidator<CreateConversationCommand>
{
    public CreateConversationCommandValidator()
    {
        RuleFor(x => x.ParticipantUserIds)
            .NotEmpty().WithMessage("At least one participant must be selected.");

        When(x => x.Type == ConversationType.Group, () =>
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Group chat title is required.")
                .MaximumLength(200).WithMessage("Group chat title cannot exceed 200 characters.");
        });
    }
}
