using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Svix;
using System.Net;
using System.Text.Json;
using EDGE.Domain.Models;

namespace EDGE.Api.Filters;

public class ClerkWebhookVerificationFilter : IEndpointFilter
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = null
    };

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var httpContext = context.HttpContext;
        var configuration = httpContext.RequestServices.GetRequiredService<IConfiguration>();
        var webhookSecret = configuration["Clerk:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
        {
            return Results.BadRequest("Webhook secret not configured");
        }

        var request = httpContext.Request;
        request.EnableBuffering();

        string body;
        using (var reader = new StreamReader(request.Body, leaveOpen: true))
        {
            body = await reader.ReadToEndAsync();
        }

        // Reset the stream position
        request.Body.Position = 0;

        var headers = request.Headers;
        var svixId = headers["svix-id"].ToString();
        var svixTimestamp = headers["svix-timestamp"].ToString();
        var svixSignature = headers["svix-signature"].ToString();

        var svixHeaders = new WebHeaderCollection
        {
            ["svix-id"] = svixId,
            ["svix-timestamp"] = svixTimestamp,
            ["svix-signature"] = svixSignature
        };

        var wh = new Webhook(webhookSecret);
        try
        {
            wh.Verify(body, svixHeaders);
        }
        catch (Exception)
        {
            return Results.Json(new { Succeeded = false, Message = "Invalid signature" }, statusCode: 401);
        }

        var payload = JsonSerializer.Deserialize<ClerkWebhookPayload>(body);
        if (payload == null)
        {
            return Results.BadRequest("Invalid payload");
        }

        // Deserialize Data based on Type
        if (payload.Type.StartsWith("user."))
        {
            var dataJson = ((JsonElement)payload.Data).GetRawText();
            var userData = JsonSerializer.Deserialize<ClerkUserData>(dataJson, SerializerOptions);
            if (userData == null)
            {
                return Results.BadRequest("Invalid user data in payload");
            }
            payload.Data = userData;
        }
        else if (payload.Type.StartsWith("session."))
        {
            var dataJson = ((JsonElement)payload.Data).GetRawText();
            var sessionData = JsonSerializer.Deserialize<ClerkSessionData>(dataJson, SerializerOptions);
            if (sessionData == null)
            {
                return Results.BadRequest("Invalid session data in payload");
            }
            payload.Data = sessionData;
        }

        httpContext.Items["ClerkWebhookPayload"] = payload;

        return await next(context);
    }
}
