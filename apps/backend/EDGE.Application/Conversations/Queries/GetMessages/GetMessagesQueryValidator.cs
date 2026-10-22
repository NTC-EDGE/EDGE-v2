using FluentValidation;

namespace EDGE.Application.Conversations.Queries.GetMessages;

public class GetMessagesQueryValidator : AbstractValidator<GetMessagesQuery>
{
    public GetMessagesQueryValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty()
            .WithMessage("ConversationId is required.");

        RuleFor(x => x.Skip)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Skip must be greater than or equal to 0.");

        RuleFor(x => x.Take)
            .InclusiveBetween(1, 100)
            .WithMessage("Take must be between 1 and 100.");
    }
}
