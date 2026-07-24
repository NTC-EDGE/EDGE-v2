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
using EDGE.Application.Storage.Commands.UploadFile;
using EDGE.Application.Storage.Dtos;
using Xunit;

namespace EDGE.Application.UnitTests.Storage;

public class UploadFileCommandHandlerTests
{
    private readonly Mock<IStorageService> _mockStorageService;
    private readonly Mock<IFileEncryptionService> _mockEncryptionService;
    private readonly Mock<IStoredFileRepository> _mockFileRepository;
    private readonly Mock<ITenantRepository> _mockTenantRepository;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly UploadFileCommandHandler _handler;

    public UploadFileCommandHandlerTests()
    {
        _mockStorageService = new Mock<IStorageService>();
        _mockEncryptionService = new Mock<IFileEncryptionService>();
        _mockFileRepository = new Mock<IStoredFileRepository>();
        _mockTenantRepository = new Mock<ITenantRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();

        _handler = new UploadFileCommandHandler(
            _mockStorageService.Object,
            _mockEncryptionService.Object,
            _mockFileRepository.Object,
            _mockTenantRepository.Object,
            _mockUnitOfWork.Object
        );
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldEncryptUploadAndSaveFileMetadata()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST" });

        var fileContent = "Applicant e-Signature Payload";
        var fileBytes = Encoding.UTF8.GetBytes(fileContent);
        using var stream = new MemoryStream(fileBytes);

        var command = new UploadFileCommand(
            FileStream: stream,
            FileName: "signature.png",
            ContentType: "image/png",
            FileSizeBytes: fileBytes.Length,
            Category: "Signature",
            TenantId: tenantId,
            UploadedByUserId: "user_123"
        );

        var fakeIv = RandomNumberGenerator.GetBytes(12);
        var fakeTag = RandomNumberGenerator.GetBytes(16);
        var encryptedStream = new MemoryStream(Encoding.UTF8.GetBytes("EncryptedCiphertext"));

        _mockEncryptionService
            .Setup(e => e.EncryptStreamAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EncryptedFileResult(encryptedStream, fakeIv, fakeTag));

        _mockStorageService
            .Setup(s => s.UploadFileAsync(It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("tenants/.../key");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.FileName.Should().Be("signature.png");
        result.Data.ContentType.Should().Be("image/png");
        result.Data.TenantId.Should().Be(tenantId);
        result.Data.Category.Should().Be("signature");

        _mockStorageService.Verify(s => s.UploadFileAsync(It.Is<string>(k => k.Contains(tenantId.ToString())), It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockFileRepository.Verify(r => r.AddAsync(It.Is<StoredFile>(f => f.TenantId == tenantId && f.FileName == "signature.png"), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentTenant_ShouldReturnFailure()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("Data"));
        var command = new UploadFileCommand(
            FileStream: stream,
            FileName: "test.png",
            ContentType: "image/png",
            FileSizeBytes: 4,
            Category: "Test",
            TenantId: tenantId,
            UploadedByUserId: "user_123"
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
        _mockStorageService.Verify(s => s.UploadFileAsync(It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
