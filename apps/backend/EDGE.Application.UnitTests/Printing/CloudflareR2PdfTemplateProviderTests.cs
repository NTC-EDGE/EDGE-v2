using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.S3.Model;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using EDGE.Infrastructure.Options;
using EDGE.Infrastructure.Printing.Services.Templates;
using Xunit;

namespace EDGE.Application.UnitTests.Printing;

public class CloudflareR2PdfTemplateProviderTests
{
    private readonly Mock<IAmazonS3> _s3Mock;
    private readonly IOptions<CloudflareR2Options> _options;
    private readonly CloudflareR2PdfTemplateProvider _provider;

    public CloudflareR2PdfTemplateProviderTests()
    {
        _s3Mock = new Mock<IAmazonS3>();
        _options = Microsoft.Extensions.Options.Options.Create(new CloudflareR2Options
        {
            AccountId = "test-account",
            AccessKeyId = "test-key",
            SecretAccessKey = "test-secret",
            BucketName = "ntc-edge-templates-test"
        });

        _provider = new CloudflareR2PdfTemplateProvider(
            _options,
            NullLogger<CloudflareR2PdfTemplateProvider>.Instance,
            _s3Mock.Object);
    }

    [Fact]
    public async Task GetTemplateResourceAsync_WhenFoundInR2_CachesAndReturnsResource()
    {
        // Arrange
        var templateId = "Assessment-SOA";
        var expectedKey = "templates/Assessment-SOA.pdf";
        var samplePdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4 Mock PDF Content");

        var getObjectResponse = new GetObjectResponse
        {
            ResponseStream = new MemoryStream(samplePdfBytes)
        };

        _s3Mock.Setup(x => x.GetObjectAsync(
                It.Is<GetObjectRequest>(r => r.BucketName == "ntc-edge-templates-test" && r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(getObjectResponse);

        // Act - First call: fetches from R2
        var resource1 = await _provider.GetTemplateResourceAsync(templateId);

        // Assert
        resource1.Should().NotBeNull();
        using (var ms = new MemoryStream())
        {
            await resource1!.Stream.CopyToAsync(ms);
            ms.ToArray().Should().BeEquivalentTo(samplePdfBytes);
        }

        // Act - Second call: should hit in-memory cache and not call S3 again
        var resource2 = await _provider.GetTemplateResourceAsync(templateId);
        resource2.Should().NotBeNull();

        _s3Mock.Verify(x => x.GetObjectAsync(
            It.Is<GetObjectRequest>(r => r.Key == expectedKey),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetTemplateResourceAsync_WhenNotFoundInR2_ReturnsNull()
    {
        // Arrange
        var templateId = "non-existent-template";
        var expectedKey = "templates/non-existent-template.pdf";

        _s3Mock.Setup(x => x.GetObjectAsync(
                It.Is<GetObjectRequest>(r => r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception("Not Found") { StatusCode = HttpStatusCode.NotFound, ErrorCode = "NoSuchKey" });

        // Act
        var resource = await _provider.GetTemplateResourceAsync(templateId);

        // Assert
        resource.Should().BeNull();
    }

    [Fact]
    public async Task UploadTemplateAsync_UploadsToS3_AndPopulatesCache()
    {
        // Arrange
        var templateId = "ntc-1-01";
        var expectedKey = "templates/ntc-1-01.pdf";
        var sampleBytes = Encoding.UTF8.GetBytes("%PDF-1.4 Template 1-01 Content");

        _s3Mock.Setup(x => x.PutObjectAsync(
                It.Is<PutObjectRequest>(r => r.BucketName == "ntc-edge-templates-test" && r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PutObjectResponse());

        // Act
        using var inputStream = new MemoryStream(sampleBytes);
        var resultKey = await _provider.UploadTemplateAsync(templateId, inputStream);

        // Assert
        resultKey.Should().Be(expectedKey);
        _s3Mock.Verify(x => x.PutObjectAsync(
            It.Is<PutObjectRequest>(r => r.Key == expectedKey),
            It.IsAny<CancellationToken>()), Times.Once);

        // Act - GetTemplateResourceAsync should return from cache without S3 GetObject call
        var cachedResource = await _provider.GetTemplateResourceAsync(templateId);
        cachedResource.Should().NotBeNull();

        _s3Mock.Verify(x => x.GetObjectAsync(
            It.IsAny<GetObjectRequest>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteTemplateAsync_DeletesFromS3_AndEvictsFromCache()
    {
        // Arrange
        var templateId = "temp-to-delete";
        var expectedKey = "templates/temp-to-delete.pdf";

        _s3Mock.Setup(x => x.DeleteObjectAsync(
                It.Is<DeleteObjectRequest>(r => r.BucketName == "ntc-edge-templates-test" && r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteObjectResponse());

        // Populate cache first via upload
        using var ms = new MemoryStream(Encoding.UTF8.GetBytes("sample"));
        await _provider.UploadTemplateAsync(templateId, ms);

        // Act
        var deleted = await _provider.DeleteTemplateAsync(templateId);

        // Assert
        deleted.Should().BeTrue();
        _s3Mock.Verify(x => x.DeleteObjectAsync(
            It.Is<DeleteObjectRequest>(r => r.Key == expectedKey),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TemplateExistsAsync_ReturnsTrue_WhenFound()
    {
        // Arrange
        var templateId = "existing-form";
        var expectedKey = "templates/existing-form.pdf";

        _s3Mock.Setup(x => x.GetObjectMetadataAsync(
                It.Is<GetObjectMetadataRequest>(r => r.BucketName == "ntc-edge-templates-test" && r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GetObjectMetadataResponse());

        // Act
        var exists = await _provider.TemplateExistsAsync(templateId);

        // Assert
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task TemplateExistsAsync_ReturnsFalse_WhenNotFoundInS3()
    {
        // Arrange
        var templateId = "missing-form";
        var expectedKey = "templates/missing-form.pdf";

        _s3Mock.Setup(x => x.GetObjectMetadataAsync(
                It.Is<GetObjectMetadataRequest>(r => r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AmazonS3Exception("Not Found") { StatusCode = HttpStatusCode.NotFound, ErrorCode = "NoSuchKey" });

        // Act
        var exists = await _provider.TemplateExistsAsync(templateId);

        // Assert
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task ListTemplatesAsync_ReturnsTemplatesFromS3()
    {
        // Arrange
        var listResponse = new ListObjectsV2Response
        {
            S3Objects = new System.Collections.Generic.List<S3Object>
            {
                new S3Object { Key = "templates/Assesment-SOA.pdf" },
                new S3Object { Key = "templates/ntc-1-01.pdf" },
                new S3Object { Key = "templates/ntc-1-02.pdf" }
            }
        };

        _s3Mock.Setup(x => x.ListObjectsV2Async(
                It.Is<ListObjectsV2Request>(r => r.BucketName == "ntc-edge-templates-test" && r.Prefix == "templates/"),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(listResponse);

        // Act
        var templates = await _provider.ListTemplatesAsync();

        // Assert
        templates.Should().Contain(new[] { "Assesment-SOA.pdf", "ntc-1-01.pdf", "ntc-1-02.pdf" });
    }

    [Fact]
    public async Task InvalidateCache_ForcesSubsequentS3Fetch()
    {
        // Arrange
        var templateId = "cache-test-doc";
        var expectedKey = "templates/cache-test-doc.pdf";
        var sampleBytes = Encoding.UTF8.GetBytes("%PDF-1.4 Sample");

        _s3Mock.Setup(x => x.GetObjectAsync(
                It.Is<GetObjectRequest>(r => r.Key == expectedKey),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new GetObjectResponse
            {
                ResponseStream = new MemoryStream(sampleBytes)
            });

        // First fetch -> caches it
        await _provider.GetTemplateResourceAsync(templateId);

        // Act - invalidate cache
        _provider.InvalidateCache(templateId);

        // Second fetch -> should call S3 again
        await _provider.GetTemplateResourceAsync(templateId);

        // Assert S3 was called twice
        _s3Mock.Verify(x => x.GetObjectAsync(
            It.Is<GetObjectRequest>(r => r.Key == expectedKey),
            It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
