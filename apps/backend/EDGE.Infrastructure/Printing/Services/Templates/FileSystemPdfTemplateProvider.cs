using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Templates;

public class FileSystemPdfTemplateProvider : IPdfTemplateProvider
{
    private readonly ConcurrentDictionary<string, PdfTemplate> _registeredTemplates = new(StringComparer.OrdinalIgnoreCase);

    public FileSystemPdfTemplateProvider()
    {
        // Register standard templates by ID
        RegisterDefaultTemplates();
    }

    public void RegisterTemplate(PdfTemplate template)
    {
        _registeredTemplates[template.Id] = template;
    }

    public Task<PdfTemplateResource?> GetTemplateResourceAsync(string templateId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return Task.FromResult<PdfTemplateResource?>(null);
        }

        // Try to get registered metadata or create default
        if (!_registeredTemplates.TryGetValue(templateId, out var template))
        {
            // Default to Overlay strategy for legacy template filenames/IDs
            string resourceName = templateId.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? templateId : $"{templateId}.pdf";
            template = new PdfTemplate(
                Id: templateId,
                Name: templateId,
                ResourceName: resourceName,
                Strategy: RenderingStrategy.Overlay);
        }

        var filePath = ResolveTemplatePath(template.ResourceName);
        if (filePath == null || !File.Exists(filePath))
        {
            return Task.FromResult<PdfTemplateResource?>(null);
        }

        var fileStream = File.OpenRead(filePath);
        var resource = new PdfTemplateResource(template, fileStream);
        return Task.FromResult<PdfTemplateResource?>(resource);
    }

    public string? ResolveTemplatePath(string resourceName)
    {
        var candidatePaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Printing", "Templates", resourceName),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, resourceName),
            Path.Combine(Directory.GetCurrentDirectory(), "Printing", "Templates", resourceName),
            Path.Combine(Directory.GetCurrentDirectory(), "EDGE.Infrastructure", "Printing", "Templates", resourceName),
            Path.Combine(Directory.GetCurrentDirectory(), "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates", resourceName)
        };

        foreach (var path in candidatePaths)
        {
            if (File.Exists(path))
            {
                return path;
            }
        }

        return null;
    }

    private void RegisterDefaultTemplates()
    {
        var defaultForms = new[]
        {
            "ntc-1-01.pdf", "ntc-1-02.pdf", "ntc-1-03.pdf", "ntc-1-04.pdf",
            "ntc-1-05.pdf", "ntc-1-09.pdf", "ntc-1-10.pdf", "ntc-1-11.pdf",
            "ntc-1-14.pdf", "ntc-1-18.pdf", "ntc-1-19.pdf", "ntc-1-20.pdf",
            "ntc-1-21.pdf", "ntc-1-22.pdf", "ntc-1-24.pdf"
        };

        foreach (var form in defaultForms)
        {
            var id = Path.GetFileNameWithoutExtension(form);
            _registeredTemplates[id] = new PdfTemplate(
                Id: id,
                Name: id,
                ResourceName: form,
                Strategy: RenderingStrategy.Overlay);

            _registeredTemplates[form] = new PdfTemplate(
                Id: form,
                Name: form,
                ResourceName: form,
                Strategy: RenderingStrategy.Overlay);
        }
    }
}
