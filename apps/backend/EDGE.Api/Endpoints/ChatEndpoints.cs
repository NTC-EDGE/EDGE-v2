using System;
using System.Collections.Generic;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using EDGE.Application.Conversations.Commands.AddParticipants;
using EDGE.Application.Conversations.Commands.CreateConversation;
using EDGE.Application.Conversations.Commands.RemoveParticipant;
using EDGE.Application.Conversations.Commands.SendMessage;
using EDGE.Application.Conversations.Queries.GetConversations;
using EDGE.Application.Conversations.Queries.GetMessages;

namespace EDGE.Api.Endpoints;

public static class ChatEndpoints
{
    public static RouteGroupBuilder MapChatEndpoints(this RouteGroupBuilder group)
    {
        var chat = group.MapGroup("chat").WithTags("Chat");

        chat.MapGet("/conversations", async ([FromQuery] Guid? tenantId, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetConversationsQuery(tenantId));
            return Results.Ok(result);
        }).WithName("GetConversations").RequireAuthorization();

        chat.MapPost("/conversations", async (
            [FromBody] CreateConversationCommand command,
            IValidator<CreateConversationCommand> validator,
            IMediator mediator) =>
        {
            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/chat/conversations/{result.Id}", result);
        }).WithName("CreateConversation").RequireAuthorization();

        chat.MapPost("/conversations/{conversationId:guid}/participants", async (
            Guid conversationId,
            [FromBody] AddConversationParticipantsCommand command,
            IValidator<AddConversationParticipantsCommand> validator,
            IMediator mediator) =>
        {
            if (command.ConversationId != conversationId)
            {
                command = command with { ConversationId = conversationId };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("AddConversationParticipants").RequireAuthorization();

        chat.MapDelete("/conversations/{conversationId:guid}/participants/{userId:guid}", async (
            Guid conversationId,
            Guid userId,
            IValidator<RemoveConversationParticipantCommand> validator,
            IMediator mediator) =>
        {
            var command = new RemoveConversationParticipantCommand(conversationId, userId);
            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            try
            {
                var result = await mediator.Send(command);
                return Results.Ok(new { success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("RemoveConversationParticipant").RequireAuthorization();

        chat.MapGet("/conversations/{conversationId:guid}/messages", async (
            Guid conversationId,
            [FromQuery] int skip,
            [FromQuery] int take,
            IMediator mediator) =>
        {
            var clampedTake = Math.Clamp(take <= 0 ? 50 : take, 1, 100);
            var clampedSkip = Math.Max(0, skip);
            var result = await mediator.Send(new GetMessagesQuery(conversationId, clampedSkip, clampedTake));
            return Results.Ok(result);
        }).WithName("GetMessages").RequireAuthorization();

        chat.MapPost("/conversations/{conversationId:guid}/messages", async (
            Guid conversationId,
            [FromBody] SendMessageCommand command,
            IValidator<SendMessageCommand> validator,
            IMediator mediator) =>
        {
            if (command.ConversationId != conversationId)
            {
                command = command with { ConversationId = conversationId };
            }

            var valResult = await validator.ValidateAsync(command);
            if (!valResult.IsValid)
            {
                return Results.ValidationProblem(valResult.ToDictionary());
            }

            var result = await mediator.Send(command);
            return Results.Ok(result);
        }).WithName("SendMessage").RequireAuthorization();

        chat.MapPost("/conversations/{conversationId:guid}/read", async (
            Guid conversationId,
            IMediator mediator) =>
        {
            try
            {
                var result = await mediator.Send(new EDGE.Application.Conversations.Commands.MarkConversationRead.MarkConversationReadCommand(conversationId));
                return Results.Ok(new { success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("MarkConversationRead").RequireAuthorization();

        chat.MapPost("/conversations/{conversationId:guid}/unread", async (
            Guid conversationId,
            IMediator mediator) =>
        {
            try
            {
                var result = await mediator.Send(new EDGE.Application.Conversations.Commands.MarkConversationUnread.MarkConversationUnreadCommand(conversationId));
                return Results.Ok(new { success = result });
            }
            catch (KeyNotFoundException ex)
            {
                return Results.NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Results.Forbid();
            }
        }).WithName("MarkConversationUnread").RequireAuthorization();

        return group;
    }
}
