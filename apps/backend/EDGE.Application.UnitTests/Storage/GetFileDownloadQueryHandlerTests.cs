using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Storage.Queries.GetFileDownload;
using Xunit;

namespace EDGE.Application.UnitTests.Storage;

public class GetFileDownloadQueryHandlerTests
{
    private readonly Mock<IStoredFileRepository> _mockFileRepository;
    private readonly Mock<IStorageService> _mockStorageService;
    private readonly Mock<IFileEncryptionService> _mockEncryptionService;
    private readonly Mock<ITenantRepository> _mockTenantRepository;
    private readonly GetFileDownloadQueryHandler _handler;

    public GetFileDownloadQueryHandlerTests()
    {
        _mockFileRepository = new Mock<IStoredFileRepository>();
        _mockStorageService = new Mock<IStorageService>();
        _mockEncryptionService = new Mock<IFileEncryptionService>();
        _mockTenantRepository = new Mock<ITenantRepository>();

        _handler = new GetFileDownloadQueryHandler(
            _mockFileRepository.Object,
            _mockStorageService.Object,
            _mockEncryptionService.Object,
            _mockTenantRepository.Object
        );
    }

    [Fact]
    public async Task Handle_WithValidIdAndMatchingTenant_ShouldFetchAndDecryptFileStream()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST" });

        var fakeIv = RandomNumberGenerator.GetBytes(12);
        var fakeTag = RandomNumberGenerator.GetBytes(16);

        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "license.pdf",
            ContentType = "application/pdf",
            FileSizeBytes = 1024,
            StorageKey = $"tenants/{tenantId}/general/fake_key",
            EncryptionIv = Convert.ToBase64String(fakeIv),
            EncryptionTag = Convert.ToBase64String(fakeTag),
            TenantId = tenantId
        };

        var cipherStream = new MemoryStream(Encoding.UTF8.GetBytes("CipherBytes"));
        var decryptedStream = new MemoryStream(Encoding.UTF8.GetBytes("Decrypted PDF Content"));

        _mockFileRepository
            .Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        _mockStorageService
            .Setup(s => s.DownloadFileAsync(storedFile.StorageKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cipherStream);

        _mockEncryptionService
            .Setup(e => e.DecryptStreamAsync(cipherStream, It.IsAny<byte[]>(), It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(decryptedStream);

        // Act
        var query = new GetFileDownloadQuery(fileId, tenantId);
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FileName.Should().Be("license.pdf");
        result.Data.ContentType.Should().Be("application/pdf");
        result.Data.FileStream.Should().BeSameAs(decryptedStream);
    }

    [Fact]
    public async Task Handle_WithMismatchedTenant_ShouldReturnAccessDenied()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var ownerTenantId = Guid.NewGuid();
        var wrongTenantId = Guid.NewGuid();

        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(wrongTenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = wrongTenantId, Name = "Wrong Tenant", Code = "WRONG" });

        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "private.pdf",
            TenantId = ownerTenantId
        };

        _mockFileRepository
            .Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        // Act
        var query = new GetFileDownloadQuery(fileId, wrongTenantId);
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("Access denied");
        _mockStorageService.Verify(s => s.DownloadFileAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenFileNotFound_ShouldReturnFail()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST" });

        _mockFileRepository
            .Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((StoredFile?)null);

        // Act
        var query = new GetFileDownloadQuery(fileId, tenantId);
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("not found");
    }
}
