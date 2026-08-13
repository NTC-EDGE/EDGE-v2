using System;
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
}
