using Microsoft.Extensions.Configuration;

namespace EDGE.Infrastructure.Extensions;

public static class ClerkConfigurationExtensions
{
    public static string GetClerkSecretKey(this IConfiguration configuration)
    {
        return configuration["Clerk:SecretKey"]
            ?? configuration["CLERK_SECRET_KEY"]
            ?? configuration["Clerk__SecretKey"]
            ?? string.Empty;
    }

    public static string? GetClerkWebhookSecret(this IConfiguration configuration)
    {
        return configuration["Clerk:WebhookSecret"]
            ?? configuration["CLERK_WEBHOOK_SECRET"]
            ?? configuration["Clerk__WebhookSecret"];
    }

    public static string? GetClerkAuthority(this IConfiguration configuration)
    {
        return configuration["Clerk:Authority"]
            ?? configuration["CLERK_AUTHORITY"]
            ?? configuration["Clerk__Authority"];
    }
}
