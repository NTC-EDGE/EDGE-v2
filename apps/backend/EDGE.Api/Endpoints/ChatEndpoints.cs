using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDGE.Application.Conversations.Commands.CreateConversation;
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

        chat.MapPost("/conversations", async ([FromBody] CreateConversationCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/v2/chat/conversations/{result.Id}", result);
        }).WithName("CreateConversation").RequireAuthorization();

        chat.MapGet("/conversations/{conversationId:guid}/messages", async (
            Guid conversationId,
            [FromQuery] int skip,
            [FromQuery] int take,
            IMediator mediator) =>
        {
            var result = await mediator.Send(new GetMessagesQuery(conversationId, skip, take == 0 ? 50 : take));
            return Results.Ok(result);
        }).WithName("GetMessages").RequireAuthorization();

        chat.MapPost("/conversations/{conversationId:guid}/messages", async (
            Guid conversationId,
            [FromBody] SendMessageCommand command,
            IMediator mediator) =>
        {
            if (command.ConversationId != conversationId)
            {
                command = command with { ConversationId = conversationId };
            }
            var result = await mediator.Send(command);
            return Results.Ok(result);
        }).WithName("SendMessage").RequireAuthorization();

        return group;
    }
}
