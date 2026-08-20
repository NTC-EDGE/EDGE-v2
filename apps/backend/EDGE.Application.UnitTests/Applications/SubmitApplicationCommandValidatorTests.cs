using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Commands.SubmitApplication;

namespace EDGE.Application.UnitTests.Applications;

public class SubmitApplicationCommandValidatorTests
{
    private readonly SubmitApplicationCommandValidator _validator;

    public SubmitApplicationCommandValidatorTests()
    {
        _validator = new SubmitApplicationCommandValidator();
    }

    private static ApplicantSubmissionDto CreateValidApplicant(string email = "applicant@example.com", string contact = "09171234567")
    {
        return new ApplicantSubmissionDto
        {
            FirstName = "Juan",
            LastName = "Dela Cruz",
            Email = email,
            ContactNumber = contact,
            FormFieldValues = new List<FormFieldValueSubmissionDto>
            {
                new FormFieldValueSubmissionDto
                {
                    FieldId = Guid.NewGuid(),
                    Value = "Test Value"
                }
            }
        };
    }

    [Fact]
    public async Task Validate_BulkModeWithSingleApplicant_PassesValidation()
    {
        // Arrange: A single applicant masquerading as bulk (Count == 1)
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant()
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task Validate_BulkModeWithMultipleApplicants_PassesValidation()
    {
        // Arrange: Bulk with multiple applicants (Count == 3)
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant("app1@example.com", "09171111111"),
                CreateValidApplicant("app2@example.com", "09172222222"),
                CreateValidApplicant("app3@example.com", "09173333333")
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public async Task Validate_BulkModeWithZeroApplicants_FailsValidation()
    {
        // Arrange: Bulk with 0 applicants
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>()
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage.Contains("Bulk submission requires at least one applicant.") ||
                                           e.ErrorMessage.Contains("At least one applicant is required."));
    }

    [Fact]
    public async Task Validate_SingleModeWithSingleApplicant_PassesValidation()
    {
        // Arrange: Single mode with exactly 1 applicant
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant()
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_SingleModeWithMultipleApplicants_FailsValidation()
    {
        // Arrange: Single mode with 2 applicants
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant("app1@example.com"),
                CreateValidApplicant("app2@example.com")
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Single submission must have exactly one applicant.");
    }

    [Fact]
    public async Task Validate_SingleModeWithZeroApplicants_FailsValidation()
    {
        // Arrange: Single mode with 0 applicants
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>()
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Single submission must have exactly one applicant.");
    }

    [Fact]
    public async Task Validate_DraftModeWithZeroApplicants_PassesApplicantCountValidation()
    {
        // Arrange: Draft with no applicants or missing tenant
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.Empty,
            ServiceId = null,
            SubmissionMode = "Bulk",
            IsDraft = true,
            Applicants = new List<ApplicantSubmissionDto>()
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("InvalidMode")]
    [InlineData("Group")]
    public async Task Validate_InvalidSubmissionMode_FailsValidation(string invalidMode)
    {
        // Arrange
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = invalidMode,
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant()
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Submission mode must be either 'Single' or 'Bulk'.");
    }

    [Theory]
    [InlineData("09171234567", true)]
    [InlineData("+639171234567", true)]
    [InlineData("639171234567", true)]
    [InlineData("12345", false)]
    [InlineData("0917123456", false)] // 10 digits instead of 11
    public async Task Validate_ApplicantContactNumber_ValidatesFormat(string contactNumber, bool shouldBeValid)
    {
        // Arrange
        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                CreateValidApplicant("test@example.com", contactNumber)
            }
        };

        // Act
        var result = await _validator.ValidateAsync(command);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
    }
}
