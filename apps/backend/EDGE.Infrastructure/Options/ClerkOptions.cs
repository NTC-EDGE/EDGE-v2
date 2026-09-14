namespace EDGE.Infrastructure.Options;

public class ClerkOptions
{
    public const string SectionName = "Clerk";

    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string Authority { get; set; } = string.Empty;
    public string[] ValidIssuers { get; set; } = [];
}
