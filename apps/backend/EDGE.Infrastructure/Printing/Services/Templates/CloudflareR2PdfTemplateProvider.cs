using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using EDGE.Infrastructure.Options;
using EDGE.Infrastructure.Printing.Models;

namespace EDGE.Infrastructure.Printing.Services.Templates;

public class CloudflareR2PdfTemplateProvider : IPdfTemplateProvider
{
    private const string TemplatePrefix = "templates/";
    private readonly CloudflareR2Options _options;
    private readonly IAmazonS3? _s3Client;
    private readonly ILogger<CloudflareR2PdfTemplateProvider> _logger;
    private readonly ConcurrentDictionary<string, byte[]> _cache = new(StringComparer.OrdinalIgnoreCase);

    public CloudflareR2PdfTemplateProvider(
        IOptions<CloudflareR2Options> options,
        ILogger<CloudflareR2PdfTemplateProvider> logger,
        IAmazonS3? s3Client = null)
    {
        _options = options?.Value ?? new CloudflareR2Options();
        _logger = logger;

        if (s3Client != null)
        {
            _s3Client = s3Client;
        }
        else if (!string.IsNullOrWhiteSpace(_options.AccountId) &&
                 !string.IsNullOrWhiteSpace(_options.AccessKeyId) &&
                 !string.IsNullOrWhiteSpace(_options.SecretAccessKey) &&
                 !string.IsNullOrWhiteSpace(_options.BucketName))
        {
            var s3Config = new AmazonS3Config
            {
                ServiceURL = _options.ServiceUrl,
                ForcePathStyle = true,
                AuthenticationRegion = "auto"
            };
            var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
            _s3Client = new AmazonS3Client(credentials, s3Config);
        }
        else
        {
            _logger.LogWarning("Cloudflare R2 configuration is incomplete for PDF Template Provider. Cloud storage operations will be disabled.");
            _s3Client = null;
        }
    }

    public async Task<PdfTemplateResource?> GetTemplateResourceAsync(string templateId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return null;
        }

        var key = GetStorageKey(templateId);
        var cleanId = NormalizeTemplateId(templateId);

        // 1. Check in-memory cache
        if (_cache.TryGetValue(key, out var cachedBytes))
        {
            var cachedTemplate = new PdfTemplate(cleanId, cleanId, Path.GetFileName(key), RenderingStrategy.Overlay);
            return new PdfTemplateResource(cachedTemplate, new MemoryStream(cachedBytes, writable: false));
        }

        // 2. Fetch from Cloudflare R2
        if (_s3Client != null)
        {
            try
            {
                var getRequest = new GetObjectRequest
                {
                    BucketName = _options.BucketName,
                    Key = key
                };

                using var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
                using var memoryStream = new MemoryStream();
                await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);

                var bytes = memoryStream.ToArray();
                _cache[key] = bytes;

                var template = new PdfTemplate(cleanId, cleanId, Path.GetFileName(key), RenderingStrategy.Overlay);
                return new PdfTemplateResource(template, new MemoryStream(bytes, writable: false));
            }
            catch (AmazonS3Exception s3Ex) when (s3Ex.StatusCode == HttpStatusCode.NotFound ||
                                                 string.Equals(s3Ex.ErrorCode, "NoSuchKey", StringComparison.OrdinalIgnoreCase) ||
                                                 string.Equals(s3Ex.ErrorCode, "NotFound", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("Template {Key} was not found in Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve template {Key} from Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
            }
        }

        // 3. Fallback check for local project files (e.g. templates/Assesment-SOA.pdf) to auto-seed
        var localFallbackPath = ResolveLocalTemplatePath(cleanId);
        if (localFallbackPath != null && File.Exists(localFallbackPath))
        {
            try
            {
                var localBytes = await File.ReadAllBytesAsync(localFallbackPath, cancellationToken);
                _cache[key] = localBytes;

                // Auto-seed to Cloudflare R2 if client is available
                if (_s3Client != null)
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            using var uploadStream = new MemoryStream(localBytes);
                            await UploadTemplateAsync(cleanId, uploadStream, "application/pdf", CancellationToken.None);
                            _logger.LogInformation("Successfully auto-seeded local template {Key} to Cloudflare R2.", key);
                        }
                        catch (Exception seedEx)
                        {
                            _logger.LogWarning(seedEx, "Could not auto-seed local template {Key} to Cloudflare R2.", key);
                        }
                    }, CancellationToken.None);
                }

                var template = new PdfTemplate(cleanId, cleanId, Path.GetFileName(key), RenderingStrategy.Overlay);
                return new PdfTemplateResource(template, new MemoryStream(localBytes, writable: false));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read local fallback template from {Path}.", localFallbackPath);
            }
        }

        return null;
    }

    public async Task<string> UploadTemplateAsync(
        string templateId,
        Stream pdfStream,
        string? contentType = "application/pdf",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            throw new ArgumentException("Template ID cannot be null or whitespace.", nameof(templateId));
        }

        if (pdfStream == null)
        {
            throw new ArgumentNullException(nameof(pdfStream));
        }

        var key = GetStorageKey(templateId);

        byte[] bytes;
        if (pdfStream is MemoryStream ms && pdfStream.CanSeek)
        {
            bytes = ms.ToArray();
        }
        else
        {
            if (pdfStream.CanSeek)
            {
                pdfStream.Position = 0;
            }
            using var copyMs = new MemoryStream();
            await pdfStream.CopyToAsync(copyMs, cancellationToken);
            bytes = copyMs.ToArray();
        }

        if (_s3Client != null)
        {
            using var uploadStream = new MemoryStream(bytes);
            var putRequest = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                InputStream = uploadStream,
                ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/pdf" : contentType,
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true
            };

            await _s3Client.PutObjectAsync(putRequest, cancellationToken);
            _logger.LogInformation("Uploaded template {Key} to Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
        }
        else
        {
            _logger.LogWarning("Cloudflare R2 is not configured; storing template {Key} only in memory cache.", key);
        }

        _cache[key] = bytes;
        return key;
    }

    public async Task<bool> DeleteTemplateAsync(string templateId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return false;
        }

        var key = GetStorageKey(templateId);
        _cache.TryRemove(key, out _);

        if (_s3Client == null)
        {
            return true;
        }

        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
            _logger.LogInformation("Deleted template {Key} from Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
            return true;
        }
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "Failed to delete template {Key} from Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting template {Key} from Cloudflare R2 bucket {BucketName}.", key, _options.BucketName);
            return false;
        }
    }

    public async Task<bool> TemplateExistsAsync(string templateId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            return false;
        }

        var key = GetStorageKey(templateId);

        if (_cache.ContainsKey(key))
        {
            return true;
        }

        if (_s3Client != null)
        {
            try
            {
                var metaRequest = new GetObjectMetadataRequest
                {
                    BucketName = _options.BucketName,
                    Key = key
                };

                await _s3Client.GetObjectMetadataAsync(metaRequest, cancellationToken);
                return true;
            }
            catch (AmazonS3Exception s3Ex) when (s3Ex.StatusCode == HttpStatusCode.NotFound ||
                                                 string.Equals(s3Ex.ErrorCode, "NoSuchKey", StringComparison.OrdinalIgnoreCase) ||
                                                 string.Equals(s3Ex.ErrorCode, "NotFound", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking existence of template {Key} in Cloudflare R2.", key);
            }
        }

        var localPath = ResolveLocalTemplatePath(NormalizeTemplateId(templateId));
        return localPath != null && File.Exists(localPath);
    }

    public async Task<IReadOnlyList<string>> ListTemplatesAsync(CancellationToken cancellationToken = default)
    {
        var resultList = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Include items in local cache
        foreach (var k in _cache.Keys)
        {
            resultList.Add(GetTemplateIdFromKey(k));
        }

        if (_s3Client != null)
        {
            try
            {
                var listRequest = new ListObjectsV2Request
                {
                    BucketName = _options.BucketName,
                    Prefix = TemplatePrefix
                };

                var response = await _s3Client.ListObjectsV2Async(listRequest, cancellationToken);
                if (response.S3Objects != null)
                {
                    foreach (var obj in response.S3Objects)
                    {
                        var id = GetTemplateIdFromKey(obj.Key);
                        if (!string.IsNullOrWhiteSpace(id))
                        {
                            resultList.Add(id);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to list templates from Cloudflare R2 bucket {BucketName}.", _options.BucketName);
            }
        }

        return resultList.OrderBy(x => x).ToList();
    }

    public void InvalidateCache(string? templateId = null)
    {
        if (string.IsNullOrWhiteSpace(templateId))
        {
            _cache.Clear();
            _logger.LogInformation("All template cache invalidated.");
        }
        else
        {
            var key = GetStorageKey(templateId);
            _cache.TryRemove(key, out _);
            _logger.LogInformation("Invalidated cache for template {Key}.", key);
        }
    }

    private static string NormalizeTemplateId(string templateId)
    {
        if (string.IsNullOrWhiteSpace(templateId)) return string.Empty;
        var clean = templateId.Trim();
        if (clean.StartsWith(TemplatePrefix, StringComparison.OrdinalIgnoreCase))
        {
            clean = clean[TemplatePrefix.Length..];
        }
        return clean;
    }

    private static string GetStorageKey(string templateId)
    {
        var clean = NormalizeTemplateId(templateId);
        var fileName = clean.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? clean : $"{clean}.pdf";
        return $"{TemplatePrefix}{fileName}";
    }

    private static string GetTemplateIdFromKey(string key)
    {
        if (key.StartsWith(TemplatePrefix, StringComparison.OrdinalIgnoreCase))
        {
            return key[TemplatePrefix.Length..];
        }
        return key;
    }

    private static string? ResolveLocalTemplatePath(string templateName)
    {
        var fileName = templateName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ? templateName : $"{templateName}.pdf";
        var candidatePaths = new[]
        {
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "templates", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "templates", fileName),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "templates", fileName),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "templates", fileName)
        };

        foreach (var path in candidatePaths)
        {
            if (File.Exists(path))
            {
                return Path.GetFullPath(path);
            }
        }

        return null;
    }
}
