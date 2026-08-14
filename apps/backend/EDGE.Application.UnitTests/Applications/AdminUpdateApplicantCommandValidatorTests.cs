using System;
using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Commands.AdminUpdateApplicant;

namespace EDGE.Application.UnitTests.Applications;

public class AdminUpdateApplicantCommandValidatorTests
{
    private readonly AdminUpdateApplicantCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldFail_WhenApplicationIdOrApplicantIdIsEmpty()
    {
        // Arrange
        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = Guid.Empty,
            ApplicantId = Guid.Empty,
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicationId");
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicantId");
    }

    [Fact]
    public void Validate_ShouldFail_WhenInvalidApplicantTypeOrStatusProvided()
    {
        // Arrange
        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            ApplicantType = "InvalidType",
            Status = "NonExistentStatus",
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicantType");
        result.Errors.Should().Contain(e => e.PropertyName == "Status");
    }

    [Fact]
    public void Validate_ShouldFail_WhenInvalidEmailFormatProvided()
    {
        // Arrange
        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            Email = "not-a-valid-email",
            Details = new AdminUpdateApplicantDetailDto
            {
                EmailAddress = "invalid-detail-email"
            },
            Company = new AdminUpdateCompanyDetailDto
            {
                Email = "invalid-comp-email"
            }
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
        result.Errors.Should().Contain(e => e.PropertyName == "Details.EmailAddress");
        result.Errors.Should().Contain(e => e.PropertyName == "Company.Email");
    }

    [Fact]
    public void Validate_ShouldPass_WhenValidCommand()
    {
        // Arrange
        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            ApplicantType = "Individual",
            Status = "Complete",
            Details = new AdminUpdateApplicantDetailDto
            {
                FirstName = "Juan",
                LastName = "Dela Cruz",
                EmailAddress = "juan@example.com",
                Height = 170.0,
                Weight = 65.0
            },
            Company = new AdminUpdateCompanyDetailDto
            {
                Name = "Acme Corp",
                Email = "corp@example.com",
                EntityType = "Corporation"
            }
        };

        // Act
        var result = _validator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }
}
