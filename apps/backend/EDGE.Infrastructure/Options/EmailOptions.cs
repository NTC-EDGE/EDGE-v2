namespace EDGE.Infrastructure.Options;

public class EmailOptions
{
    public const string SectionName = "Email";

    public bool Enabled { get; set; } = true;
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string FromAddress { get; set; } = "no-reply@ntc.gov.ph";
    public string FromName { get; set; } = "NTC EDGE Portal";
    public string ClientPortalBaseUrl { get; set; } = "http://localhost:8081";
    public string InternalPortalBaseUrl { get; set; } = "http://localhost:8082";
}
