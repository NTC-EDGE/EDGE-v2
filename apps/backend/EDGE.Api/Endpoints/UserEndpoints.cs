using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using FluentValidation;
using EDGE.Domain.Authorization;
using EDGE.Application.Users.Queries;
using EDGE.Application.Users.Commands.UpdateUser;
using EDGE.Application.Users.Commands.DeleteUser;

namespace EDGE.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").WithTags("Users");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUsersQuery());
            return Results.Ok(result);
        })
        .WithName("GetUsers")
        .WithTags("Users")
        .WithSummary("Get list of platform users")
        .WithDescription("Retrieves user accounts.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetUserByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("GetUserById")
        .WithTags("Users")
        .WithSummary("Get user profile by ID")
        .WithDescription("Fetches single user profile by ID.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapPut("/{id:guid}", async (
            Guid id,
            AdminUpdateUserCommand command,
            IValidator<AdminUpdateUserCommand> validator,
            IMediator mediator) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest("Route ID does not match request body ID.");
            }

            var validationResult = await validator.ValidateAsync(command);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        })
        .WithName("UpdateUser")
        .WithTags("Users")
        .WithSummary("Update user profile")
        .WithDescription("Updates user name, email, or active state.")
        .RequireAuthorization(Policies.CanManageUsers);

        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteUserCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        })
        .WithName("DeleteUser")
        .WithTags("Users")
        .WithSummary("Delete user account")
        .WithDescription("Deletes user account.")
        .RequireAuthorization(Policies.CanManageUsers);
    }
}
