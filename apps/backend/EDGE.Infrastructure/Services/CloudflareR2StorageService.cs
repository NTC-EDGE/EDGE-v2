using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Options;

namespace EDGE.Infrastructure.Services;

public class CloudflareR2StorageService : IStorageService
{
    private readonly CloudflareR2Options _options;
    private readonly IAmazonS3 _s3Client;

    public CloudflareR2StorageService(IOptions<CloudflareR2Options> options)
    {
        _options = options.Value;

        if (string.IsNullOrWhiteSpace(_options.AccountId) ||
            string.IsNullOrWhiteSpace(_options.AccessKeyId) ||
            string.IsNullOrWhiteSpace(_options.SecretAccessKey) ||
            string.IsNullOrWhiteSpace(_options.BucketName))
        {
            throw new InvalidOperationException(
                "Cloudflare R2 configuration is incomplete. AccountId, AccessKeyId, SecretAccessKey, and BucketName are required.");
        }

        var s3Config = new AmazonS3Config
        {
            ServiceURL = _options.ServiceUrl,
            ForcePathStyle = true
        };

        var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
        _s3Client = new AmazonS3Client(credentials, s3Config);
    }

    public async Task<string> UploadFileAsync(string storageKey, Stream contentStream, string contentType, CancellationToken cancellationToken = default)
    {
        if (contentStream.CanSeek)
        {
            contentStream.Position = 0;
        }

        var putRequest = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = storageKey,
            InputStream = contentStream,
            ContentType = string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType,
            DisablePayloadSigning = true
        };

        await _s3Client.PutObjectAsync(putRequest, cancellationToken);
        return storageKey;
    }

    public async Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var getRequest = new GetObjectRequest
        {
            BucketName = _options.BucketName,
            Key = storageKey
        };

        var response = await _s3Client.GetObjectAsync(getRequest, cancellationToken);
        var memoryStream = new MemoryStream();
        await response.ResponseStream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var deleteRequest = new DeleteObjectRequest
        {
            BucketName = _options.BucketName,
            Key = storageKey
        };

        await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
    }
}
