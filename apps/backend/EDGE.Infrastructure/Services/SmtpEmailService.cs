using System;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Options;

namespace EDGE.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ISystemConfigRepository _systemConfigRepository;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(
        IOptions<EmailOptions> options,
        ISystemConfigRepository systemConfigRepository,
        ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _systemConfigRepository = systemConfigRepository;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(
        string toEmail,
        string? toName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail) || !toEmail.Contains('@'))
        {
            _logger.LogWarning("Skipped sending email because recipient address '{ToEmail}' is invalid.", toEmail);
            return false;
        }

        if (!_options.Enabled)
        {
            _logger.LogInformation("Email delivery is disabled in EmailOptions. Simulated email to '{ToEmail}' with Subject: '{Subject}'.", toEmail, subject);
            return true;
        }

        var dbEmailEnabled = await _systemConfigRepository.GetByKeyAsync("EMAIL_ENABLED", cancellationToken);
        if (dbEmailEnabled != null && bool.TryParse(dbEmailEnabled.Value, out var isDbEmailEnabled) && !isDbEmailEnabled)
        {
            _logger.LogInformation("Email delivery is disabled via Admin System Configuration (EMAIL_ENABLED=false). Simulated email to '{ToEmail}' with Subject: '{Subject}'.", toEmail, subject);
            return true;
        }

        var smtpHost = _options.SmtpHost;
        var smtpPort = _options.SmtpPort;
        var useSsl = _options.UseSsl;
        var smtpUsername = _options.SmtpUsername;
        var smtpPassword = _options.SmtpPassword;
        var fromAddress = _options.FromAddress;
        var fromName = _options.FromName;

        var dbHost = await _systemConfigRepository.GetByKeyAsync("SMTP_SERVER", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dbHost?.Value))
        {
            smtpHost = dbHost.Value.Trim();
        }

        var dbPort = await _systemConfigRepository.GetByKeyAsync("SMTP_PORT", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dbPort?.Value) && int.TryParse(dbPort.Value.Trim(), out var parsedPort) && parsedPort > 0)
        {
            smtpPort = parsedPort;
        }
        else if (smtpPort <= 0)
        {
            smtpPort = 587;
        }

        var dbUseSsl = await _systemConfigRepository.GetByKeyAsync("SMTP_USE_SSL", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dbUseSsl?.Value) && bool.TryParse(dbUseSsl.Value.Trim(), out var parsedSsl))
        {
            useSsl = parsedSsl;
        }

        if (string.IsNullOrWhiteSpace(smtpUsername))
        {
            var dbUsername = await _systemConfigRepository.GetByKeyAsync("SMTP_USERNAME", cancellationToken);
            if (!string.IsNullOrWhiteSpace(dbUsername?.Value))
            {
                smtpUsername = dbUsername.Value.Trim();
            }
        }

        if (string.IsNullOrWhiteSpace(smtpPassword))
        {
            var dbPassword = await _systemConfigRepository.GetByKeyAsync("SMTP_PASSWORD", cancellationToken);
            if (!string.IsNullOrWhiteSpace(dbPassword?.Value))
            {
                smtpPassword = dbPassword.Value;
            }
        }

        var dbFromEmail = await _systemConfigRepository.GetByKeyAsync("SMTP_FROM_EMAIL", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dbFromEmail?.Value))
        {
            fromAddress = dbFromEmail.Value.Trim();
        }
        else if (string.IsNullOrWhiteSpace(fromAddress))
        {
            var dbSupportEmail = await _systemConfigRepository.GetByKeyAsync("SUPPORT_EMAIL", cancellationToken);
            fromAddress = !string.IsNullOrWhiteSpace(dbSupportEmail?.Value) ? dbSupportEmail.Value.Trim() : "no-reply@ntc.gov.ph";
        }

        var dbFromName = await _systemConfigRepository.GetByKeyAsync("SMTP_FROM_NAME", cancellationToken);
        if (!string.IsNullOrWhiteSpace(dbFromName?.Value))
        {
            fromName = dbFromName.Value.Trim();
        }

        // If no live SMTP host or credentials are configured (e.g., local development environment or placeholder smtp.ntc.gov.ph without credentials),
        // log the email dispatch cleanly so application workflows succeed without network timeouts.
        bool isUnconfiguredPlaceholderHost = string.IsNullOrWhiteSpace(smtpHost) ||
            (string.Equals(smtpHost, "smtp.ntc.gov.ph", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(smtpUsername));

        if (isUnconfiguredPlaceholderHost)
        {
            _logger.LogInformation(
                "[Email Dispatch Log] To: {ToName} <{ToEmail}> | Subject: {Subject} | BodyLength: {BodyLength} chars (Configure SMTP_SERVER / SMTP_USERNAME in Admin System Configuration or EmailOptions for live SMTP delivery)",
                toName ?? "Recipient",
                toEmail,
                subject,
                htmlBody?.Length ?? 0);
            return true;
        }

        try
        {
            using var message = new MailMessage
            {
                From = new MailAddress(fromAddress, string.IsNullOrWhiteSpace(fromName) ? "NTC EDGE Portal" : fromName),
                Subject = subject,
                Body = htmlBody ?? string.Empty,
                IsBodyHtml = true
            };

            message.To.Add(string.IsNullOrWhiteSpace(toName)
                ? new MailAddress(toEmail.Trim())
                : new MailAddress(toEmail.Trim(), toName.Trim()));

            using var smtpClient = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = useSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 15000
            };

            if (!string.IsNullOrWhiteSpace(smtpUsername))
            {
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
            }

            await smtpClient.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Successfully sent email to '{ToEmail}' with Subject '{Subject}'.", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMTP email to '{ToEmail}' with Subject '{Subject}'.", toEmail, subject);
            return false;
        }
    }
}
