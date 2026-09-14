using FluentValidation;

namespace EDGE.Application.Users.Commands.SyncClerkUsers;

public class SyncClerkUsersCommandValidator : AbstractValidator<SyncClerkUsersCommand>
{
    public SyncClerkUsersCommandValidator()
    {
    }
}
