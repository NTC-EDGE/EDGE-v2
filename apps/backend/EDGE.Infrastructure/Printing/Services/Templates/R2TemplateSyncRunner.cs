using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Infrastructure.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EDGE.Infrastructure.Printing.Services.Templates;

/// <summary>
/// Uploads all active official PDF templates from the backend Templates directory
/// to Cloudflare R2 (under templates/&lt;fileName&gt;) using configured CloudflareR2 options
/// (including .NET User Secrets) and optionally prunes obsolete/duplicate template keys.
/// </summary>
public static class R2TemplateSyncRunner
{
    public static readonly IReadOnlyList<string> ObsoleteTemplateFileNames =
    [
        "ntc-1-05.pdf",
        "ntc-1-10.pdf",
        "ntc-1-14.pdf",
        "ntc-1-24.pdf",
        "OfficialReciept.pdf",
        "Assesment-SOA.pdf",
        "MIS-EDGE-REPORT.pdf",
        "MIS_Report.pdf",
        "Reporting_Format_Licensing.pdf",
        "Reporting_Format_Licensing_Final.pdf"
    ];

    public static async Task<int> RunAsync(
        IConfiguration configuration,
        string[] args,
        CancellationToken cancellationToken = default)
    {
        var r2Options = new CloudflareR2Options();
        configuration.GetSection(CloudflareR2Options.SectionName).Bind(r2Options);

        if (string.IsNullOrWhiteSpace(r2Options.AccountId) ||
            string.IsNullOrWhiteSpace(r2Options.AccessKeyId) ||
            string.IsNullOrWhiteSpace(r2Options.SecretAccessKey) ||
            string.IsNullOrWhiteSpace(r2Options.BucketName))
        {
            Console.Error.WriteLine(
                "CloudflareR2 configuration is incomplete. Please ensure CloudflareR2:AccountId, " +
                "CloudflareR2:AccessKeyId, CloudflareR2:SecretAccessKey, and CloudflareR2:BucketName " +
                "are configured in .NET User Secrets or environment variables.");
            return 1;
        }

        string? explicitDir = null;
        for (int i = 0; i < args.Length - 1; i++)
        {
            if (string.Equals(args[i], "--dir", StringComparison.OrdinalIgnoreCase))
            {
                explicitDir = args[i + 1];
                break;
            }
        }

        bool pruneObsolete = args.Any(a => string.Equals(a, "--prune-obsolete", StringComparison.OrdinalIgnoreCase));
        var templatesDir = ResolveTemplatesDirectory(explicitDir);
        if (string.IsNullOrWhiteSpace(templatesDir) || !Directory.Exists(templatesDir))
        {
            Console.Error.WriteLine($"Could not locate Printing/Templates directory (checked '{explicitDir ?? "auto"}').");
            return 1;
        }

        var obsoleteSet = new HashSet<string>(ObsoleteTemplateFileNames, StringComparer.OrdinalIgnoreCase);
        var pdfFiles = Directory.GetFiles(templatesDir, "*.pdf", SearchOption.TopDirectoryOnly)
            .Where(f => !obsoleteSet.Contains(Path.GetFileName(f)))
            .OrderBy(f => Path.GetFileName(f), StringComparer.OrdinalIgnoreCase)
            .ToList();

        Console.WriteLine($"[R2 Template Sync] Source directory: {templatesDir}");
        Console.WriteLine($"[R2 Template Sync] Target bucket:    {r2Options.BucketName}");
        Console.WriteLine($"[R2 Template Sync] Active PDFs:      {pdfFiles.Count}");

        using var loggerFactory = LoggerFactory.Create(b => b.SetMinimumLevel(LogLevel.Warning).AddConsole());
        var logger = loggerFactory.CreateLogger<CloudflareR2PdfTemplateProvider>();
        var provider = new CloudflareR2PdfTemplateProvider(
            Microsoft.Extensions.Options.Options.Create(r2Options),
            logger);

        int uploaded = 0;
        int failed = 0;
        using var semaphore = new SemaphoreSlim(6);

        var uploadTasks = pdfFiles.Select(async filePath =>
        {
            var fileName = Path.GetFileName(filePath);
            await semaphore.WaitAsync(cancellationToken);
            try
            {
                await using var fs = File.OpenRead(filePath);
                await provider.UploadTemplateAsync(fileName, fs, "application/pdf", cancellationToken);
                var count = Interlocked.Increment(ref uploaded);
                if (count % 15 == 0 || count == pdfFiles.Count)
                {
                    Console.WriteLine($"  Uploaded {count}/{pdfFiles.Count} templates...");
                }
            }
            catch (Exception ex)
            {
                Interlocked.Increment(ref failed);
                Console.Error.WriteLine($"  [FAILED] {fileName}: {ex.Message}");
            }
            finally
            {
                semaphore.Release();
            }
        }).ToList();

        await Task.WhenAll(uploadTasks);

        if (pruneObsolete)
        {
            Console.WriteLine($"[R2 Template Sync] Pruning {ObsoleteTemplateFileNames.Count} obsolete/duplicate keys from R2...");
            foreach (var obsoleteName in ObsoleteTemplateFileNames)
            {
                await provider.DeleteTemplateAsync(obsoleteName, cancellationToken);
            }
        }

        var remoteTemplates = await provider.ListTemplatesAsync(cancellationToken);
        Console.WriteLine($"[R2 Template Sync] Completed. Uploaded={uploaded}, Failed={failed}, TotalListed={remoteTemplates.Count}");
        return failed == 0 ? 0 : 2;
    }

    private static string? ResolveTemplatesDirectory(string? explicitDir)
    {
        if (!string.IsNullOrWhiteSpace(explicitDir))
        {
            return Path.GetFullPath(explicitDir);
        }

        var roots = new[] { Directory.GetCurrentDirectory(), AppDomain.CurrentDomain.BaseDirectory };
        foreach (var root in roots)
        {
            if (string.IsNullOrWhiteSpace(root)) continue;
            var dir = new DirectoryInfo(root);
            while (dir != null)
            {
                var candidate = Path.Combine(dir.FullName, "apps", "backend", "EDGE.Infrastructure", "Printing", "Templates");
                if (Directory.Exists(candidate)) return candidate;

                var direct = Path.Combine(dir.FullName, "Printing", "Templates");
                if (Directory.Exists(direct)) return direct;

                dir = dir.Parent;
            }
        }

        return null;
    }
}
