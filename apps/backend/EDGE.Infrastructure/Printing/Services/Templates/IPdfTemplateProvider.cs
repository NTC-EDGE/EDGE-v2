using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Templates;

public interface IPdfTemplateProvider
{
    Task<PdfTemplateResource?> GetTemplateResourceAsync(string templateId, CancellationToken cancellationToken = default);
}
