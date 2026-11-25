using System.Threading;
using System.Threading.Tasks;

namespace EDGE.Application.Common.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(
        string toEmail,
        string? toName,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default);
}
