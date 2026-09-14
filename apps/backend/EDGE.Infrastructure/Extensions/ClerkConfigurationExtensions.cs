using Microsoft.Extensions.Configuration;

namespace EDGE.Infrastructure.Extensions;

public static class ClerkConfigurationExtensions
{
    public static string GetClerkSecretKey(this IConfiguration configuration)
    {
        var raw = configuration["Clerk:SecretKey"]
            ?? configuration["CLERK_SECRET_KEY"]
            ?? configuration["Clerk__SecretKey"]
            ?? string.Empty;

        var clean = raw.Trim().Trim('\"', '\'');
        if (clean.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            clean = clean["Bearer ".Length..].Trim();
        }

        return clean;
    }

    public static string? GetClerkWebhookSecret(this IConfiguration configuration)
    {
        var raw = configuration["Clerk:WebhookSecret"]
            ?? configuration["CLERK_WEBHOOK_SECRET"]
            ?? configuration["Clerk__WebhookSecret"];

        if (string.IsNullOrWhiteSpace(raw)) return null;

        return raw.Trim().Trim('\"', '\'');
    }

    public static string? GetClerkAuthority(this IConfiguration configuration)
    {
        var raw = configuration["Clerk:Authority"]
            ?? configuration["CLERK_AUTHORITY"]
            ?? configuration["Clerk__Authority"];

        if (string.IsNullOrWhiteSpace(raw)) return null;

        return raw.Trim().Trim('\"', '\'');
    }
}
