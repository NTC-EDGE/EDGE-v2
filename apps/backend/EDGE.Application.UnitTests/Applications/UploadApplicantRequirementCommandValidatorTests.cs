using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.UploadApplicantRequirement;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Applications;

public class UploadApplicantRequirementCommandValidatorTests
{
    private readonly Mock<IStoredFileRepository> _mockFileRepo;
    private readonly Mock<IStorageService> _mockStorageService;
    private readonly Mock<IFileEncryptionService> _mockEncryptionService;
    private readonly UploadApplicantRequirementCommandValidator _validator;

    public UploadApplicantRequirementCommandValidatorTests()
    {
        _mockFileRepo = new Mock<IStoredFileRepository>();
        _mockStorageService = new Mock<IStorageService>();
        _mockEncryptionService = new Mock<IFileEncryptionService>();
        _validator = new UploadApplicantRequirementCommandValidator(
            _mockFileRepo.Object,
            _mockStorageService.Object,
            _mockEncryptionService.Object);
    }

    [Fact]
    public async Task Validate_ImageFile_PassesValidation()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "passport.jpg",
            ContentType = "image/jpeg"
        };

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_PdfFile_PassesValidation()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "document.pdf",
            ContentType = "application/pdf"
        };

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_OctetStreamContentType_WithValidExtension_PassesValidation()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "id_scan.png",
            ContentType = "application/octet-stream"
        };

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_ExecutableFile_FailsValidation()
    {
        // Arrange
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "malware.exe",
            ContentType = "application/x-msdownload"
        };

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Only image files"));
    }

    [Fact]
    public async Task Validate_SpoofedMimeType_FailsValidation()
    {
        // Arrange: Executable extension with spoofed image MIME type
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "script.sh",
            ContentType = "image/jpeg"
        };

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public async Task Validate_WithEncryptedStorageStream_DecryptsAndValidatesMagicHeader()
    {
        // Arrange: Encrypted PDF in storage
        var fileId = Guid.NewGuid();
        var storageKey = "tenants/tenant123/requirements/file123";
        var ivBytes = new byte[12];
        var tagBytes = new byte[16];
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "clearance.pdf",
            ContentType = "application/pdf",
            StorageKey = storageKey,
            EncryptionIv = Convert.ToBase64String(ivBytes),
            EncryptionTag = Convert.ToBase64String(tagBytes)
        };

        var cipherStream = new MemoryStream(new byte[] { 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF });
        var pdfHeaderBytes = new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34 }; // %PDF-1.4
        var decryptedPlainStream = new MemoryStream(pdfHeaderBytes);

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        _mockStorageService.Setup(s => s.DownloadFileAsync(storageKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cipherStream);

        _mockEncryptionService.Setup(e => e.DecryptStreamAsync(
                It.IsAny<Stream>(),
                It.IsAny<byte[]>(),
                It.IsAny<byte[]>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(decryptedPlainStream);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert: Valid decrypted PDF stream passes
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_WithEncryptedStorageStream_WhenDecryptionUnavailable_FallsBackSafely()
    {
        // Arrange: Validator without encryption service configured
        var validatorWithoutEncryption = new UploadApplicantRequirementCommandValidator(
            _mockFileRepo.Object,
            _mockStorageService.Object,
            null);

        var fileId = Guid.NewGuid();
        var storageKey = "tenants/tenant123/requirements/file123";
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "valid_photo.jpg",
            ContentType = "image/jpeg",
            StorageKey = storageKey,
            EncryptionIv = Convert.ToBase64String(new byte[12]),
            EncryptionTag = Convert.ToBase64String(new byte[16])
        };

        var cipherStream = new MemoryStream(new byte[] { 0xAA, 0xBB, 0xCC, 0xDD });

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        _mockStorageService.Setup(s => s.DownloadFileAsync(storageKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(cipherStream);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await validatorWithoutEncryption.ValidateAsync(command);

        // Assert: Valid extension and MIME passes safely without ciphertext false rejection
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_WithPlaintextStorageStream_ExecutableMagicBytes_FailsValidation()
    {
        // Arrange: Unencrypted file in storage with spoofed PDF name but MZ executable bytes
        var fileId = Guid.NewGuid();
        var storageKey = "storage/key/fake.pdf";
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "fake.pdf",
            ContentType = "application/pdf",
            StorageKey = storageKey
        };

        var fakeExeHeaderBytes = new byte[] { 0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00 };
        var memoryStream = new MemoryStream(fakeExeHeaderBytes);

        _mockFileRepo.Setup(r => r.GetByIdAsync(fileId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(storedFile);

        _mockStorageService.Setup(s => s.DownloadFileAsync(storageKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(memoryStream);

        var command = new UploadApplicantRequirementCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            RequirementId = Guid.NewGuid(),
            StoredFileId = fileId
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert: pipeline must fail because magic header bytes are MZ (executable), not %PDF
        result.IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(new byte[] { 0x25, 0x50, 0x44, 0x46 }, true)] // PDF
    [InlineData(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, true)] // JPEG
    [InlineData(new byte[] { 0x89, 0x50, 0x4E, 0x47 }, true)] // PNG
    [InlineData(new byte[] { 0x47, 0x49, 0x46, 0x38 }, true)] // GIF
    [InlineData(new byte[] { 0x42, 0x4D, 0x00, 0x00 }, true)] // BMP
    [InlineData(new byte[] { 0x4D, 0x5A, 0x90, 0x00 }, false)] // EXE (MZ)
    public void IsValidMagicHeader_ValidatesFileSignaturesCorrectly(byte[] header, bool expected)
    {
        // Act
        var isValid = UploadApplicantRequirementCommandValidator.IsValidMagicHeader(header);

        // Assert
        isValid.Should().Be(expected);
    }
}
