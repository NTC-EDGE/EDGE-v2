using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Exceptions;
using EDGE.Infrastructure.Options;

namespace EDGE.Infrastructure.Services;

public class CloudflareR2StorageService : IStorageService
{
    private readonly CloudflareR2Options _options;
    private readonly IAmazonS3 _s3Client;
    private readonly ILogger<CloudflareR2StorageService> _logger;

    public CloudflareR2StorageService(
        IOptions<CloudflareR2Options> options,
        ILogger<CloudflareR2StorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

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
            ForcePathStyle = true,
            AuthenticationRegion = "auto"
        };

        var credentials = new BasicAWSCredentials(_options.AccessKeyId, _options.SecretAccessKey);
        _s3Client = new AmazonS3Client(credentials, s3Config);
    }

    public async Task<string> UploadFileAsync(string storageKey, Stream contentStream, string contentType, CancellationToken cancellationToken = default)
    {
        try
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
                DisablePayloadSigning = true,
                DisableDefaultChecksumValidation = true
            };

            await _s3Client.PutObjectAsync(putRequest, cancellationToken);
            return storageKey;
        }
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "Amazon S3 upload failed for storage key {StorageKey} in bucket {BucketName}. ErrorCode: {ErrorCode}, StatusCode: {StatusCode}.", storageKey, _options.BucketName, s3Ex.ErrorCode, s3Ex.StatusCode);
            throw new StorageException("Failed to upload the file to cloud storage.", s3Ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected storage service error occurred during file upload for key {StorageKey}.", storageKey);
            throw new StorageException("The storage service is currently unreachable. Please try again later.", ex);
        }
    }

    public async Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        try
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
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "Amazon S3 download failed for storage key {StorageKey} in bucket {BucketName}. ErrorCode: {ErrorCode}, StatusCode: {StatusCode}.", storageKey, _options.BucketName, s3Ex.ErrorCode, s3Ex.StatusCode);
            throw new StorageException("Failed to retrieve the file from cloud storage.", s3Ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected storage service error occurred during file download for key {StorageKey}.", storageKey);
            throw new StorageException("The storage service is currently unreachable. Please try again later.", ex);
        }
    }

    public async Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var deleteRequest = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = storageKey
            };

            await _s3Client.DeleteObjectAsync(deleteRequest, cancellationToken);
        }
        catch (AmazonS3Exception s3Ex)
        {
            _logger.LogError(s3Ex, "Amazon S3 delete failed for storage key {StorageKey} in bucket {BucketName}. ErrorCode: {ErrorCode}, StatusCode: {StatusCode}.", storageKey, _options.BucketName, s3Ex.ErrorCode, s3Ex.StatusCode);
            throw new StorageException("Failed to delete the file from cloud storage.", s3Ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected storage service error occurred during file deletion for key {StorageKey}.", storageKey);
            throw new StorageException("The storage service is currently unreachable. Please try again later.", ex);
        }
    }
}
