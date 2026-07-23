using System;
using System.IO;
using System.Text;
using System.Threading;
using FluentValidation.TestHelper;
using Moq;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Storage.Commands.UploadFile;
using Xunit;

namespace EDGE.Application.UnitTests.Storage;

public class UploadFileCommandValidatorTests
{
    private readonly Mock<ITenantRepository> _mockTenantRepository;
    private readonly UploadFileCommandValidator _validator;

    public UploadFileCommandValidatorTests()
    {
        _mockTenantRepository = new Mock<ITenantRepository>();
        _mockTenantRepository
            .Setup(t => t.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = Guid.NewGuid(), Name = "Sample Tenant", Code = "SAMPLE" });

        _validator = new UploadFileCommandValidator(_mockTenantRepository.Object);
    }

    [Fact]
    public async Task Validate_WithValidCommand_ShouldNotHaveAnyValidationErrors()
    {
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("Test bytes"));
        var command = new UploadFileCommand(
            FileStream: stream,
            FileName: "test.pdf",
            ContentType: "application/pdf",
            FileSizeBytes: 10,
            Category: "Requirement",
            TenantId: Guid.NewGuid(),
            UploadedByUserId: "user_1"
        );

        var result = await _validator.TestValidateAsync(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public async Task Validate_WithEmptyFileStream_ShouldHaveValidationError()
    {
        using var emptyStream = new MemoryStream();
        var command = new UploadFileCommand(
            FileStream: emptyStream,
            FileName: "test.pdf",
            ContentType: "application/pdf",
            FileSizeBytes: 0,
            Category: "Requirement",
            TenantId: Guid.NewGuid(),
            UploadedByUserId: "user_1"
        );

        var result = await _validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor(c => c.FileStream);
    }

    [Fact]
    public async Task Validate_WithMissingFields_ShouldHaveValidationErrors()
    {
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("Test bytes"));
        var command = new UploadFileCommand(
            FileStream: stream,
            FileName: "",
            ContentType: "",
            FileSizeBytes: 0,
            Category: "",
            TenantId: Guid.Empty,
            UploadedByUserId: ""
        );

        var result = await _validator.TestValidateAsync(command);
        result.ShouldHaveValidationErrorFor(c => c.FileName);
        result.ShouldHaveValidationErrorFor(c => c.ContentType);
        result.ShouldHaveValidationErrorFor(c => c.FileSizeBytes);
        result.ShouldHaveValidationErrorFor(c => c.Category);
        result.ShouldHaveValidationErrorFor(c => c.TenantId);
        result.ShouldHaveValidationErrorFor(c => c.UploadedByUserId);
    }
}
