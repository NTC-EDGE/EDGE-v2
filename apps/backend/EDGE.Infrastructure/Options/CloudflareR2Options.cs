namespace EDGE.Infrastructure.Options;

public class CloudflareR2Options
{
    public const string SectionName = "CloudflareR2";

    public string AccountId { get; set; } = string.Empty;
    public string AccessKeyId { get; set; } = string.Empty;
    public string SecretAccessKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;

    public string ServiceUrl => !string.IsNullOrWhiteSpace(AccountId)
        ? $"https://{AccountId}.r2.cloudflarestorage.com"
        : string.Empty;
}
