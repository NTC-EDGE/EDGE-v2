using System;
using System.IO;
using System.Threading.Tasks;

namespace EDGE.Infrastructure.Printing.Models;

public sealed class PdfTemplateResource : IAsyncDisposable, IDisposable
{
    public PdfTemplate Template { get; }
    public Stream Stream { get; }

    public PdfTemplateResource(PdfTemplate template, Stream stream)
    {
        Template = template ?? throw new ArgumentNullException(nameof(template));
        Stream = stream ?? throw new ArgumentNullException(nameof(stream));
    }

    public void Dispose()
    {
        Stream.Dispose();
    }

    public ValueTask DisposeAsync()
    {
        return Stream.DisposeAsync();
    }
}
