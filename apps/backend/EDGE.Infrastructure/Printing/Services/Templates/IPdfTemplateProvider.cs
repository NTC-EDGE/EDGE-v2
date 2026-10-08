using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Templates;

public interface IPdfTemplateProvider
{
    Task<PdfTemplateResource?> GetTemplateResourceAsync(string templateId, CancellationToken cancellationToken = default);
    Task<string> UploadTemplateAsync(string templateId, Stream pdfStream, string? contentType = "application/pdf", CancellationToken cancellationToken = default);
    Task<bool> DeleteTemplateAsync(string templateId, CancellationToken cancellationToken = default);
    Task<bool> TemplateExistsAsync(string templateId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> ListTemplatesAsync(CancellationToken cancellationToken = default);
    void InvalidateCache(string? templateId = null);
}
