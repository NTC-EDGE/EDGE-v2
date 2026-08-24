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
    private readonly UploadApplicantRequirementCommandValidator _validator;

    public UploadApplicantRequirementCommandValidatorTests()
    {
        _mockFileRepo = new Mock<IStoredFileRepository>();
        _validator = new UploadApplicantRequirementCommandValidator(_mockFileRepo.Object);
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
    public async Task Validate_PngFile_PassesValidation()
    {
        // Arrange: valid PNG file
        var fileId = Guid.NewGuid();
        var storedFile = new StoredFile
        {
            Id = fileId,
            FileName = "id_photo.png",
            ContentType = "image/png",
            StorageKey = "storage/key/id_photo.png"
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

        // Assert: PNG file passes validation
        result.IsValid.Should().BeTrue();
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
