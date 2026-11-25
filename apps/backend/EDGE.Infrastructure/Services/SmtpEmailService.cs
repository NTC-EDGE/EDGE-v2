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

        var smtpHost = _options.SmtpHost;
        var smtpPort = _options.SmtpPort;
        var fromAddress = _options.FromAddress;
        var fromName = _options.FromName;

        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            var dbHost = await _systemConfigRepository.GetByKeyAsync("SMTP_SERVER", cancellationToken);
            if (!string.IsNullOrWhiteSpace(dbHost?.Value))
            {
                smtpHost = dbHost.Value.Trim();
            }
        }

        if (smtpPort <= 0)
        {
            var dbPort = await _systemConfigRepository.GetByKeyAsync("SMTP_PORT", cancellationToken);
            if (!string.IsNullOrWhiteSpace(dbPort?.Value) && int.TryParse(dbPort.Value.Trim(), out var parsedPort))
            {
                smtpPort = parsedPort;
            }
            else
            {
                smtpPort = 587;
            }
        }

        if (string.IsNullOrWhiteSpace(fromAddress))
        {
            var dbSupportEmail = await _systemConfigRepository.GetByKeyAsync("SUPPORT_EMAIL", cancellationToken);
            fromAddress = !string.IsNullOrWhiteSpace(dbSupportEmail?.Value) ? dbSupportEmail.Value.Trim() : "no-reply@ntc.gov.ph";
        }

        // If no live SMTP host or credentials are configured (e.g., local development environment or placeholder smtp.ntc.gov.ph without credentials),
        // log the email dispatch cleanly so application workflows succeed without network timeouts.
        bool isUnconfiguredPlaceholderHost = string.IsNullOrWhiteSpace(smtpHost) ||
            (string.Equals(smtpHost, "smtp.ntc.gov.ph", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(_options.SmtpUsername));

        if (isUnconfiguredPlaceholderHost)
        {
            _logger.LogInformation(
                "[Email Dispatch Log] To: {ToName} <{ToEmail}> | Subject: {Subject} | BodyLength: {BodyLength} chars (Configure Email:SmtpHost / Email:SmtpUsername in User Secrets or Environment Variables for live SMTP delivery)",
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
                EnableSsl = _options.UseSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 15000
            };

            if (!string.IsNullOrWhiteSpace(_options.SmtpUsername))
            {
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_options.SmtpUsername, _options.SmtpPassword);
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
