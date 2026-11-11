using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.AdminUpdateApplicantProfile;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class AdminUpdateApplicantProfileCommandTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo = new();
    private readonly Mock<ICurrentUserService> _mockCurrentUserService = new();
    private readonly Mock<IUnitOfWork> _mockUnitOfWork = new();
    private readonly Mock<ILogger<AdminUpdateApplicantProfileCommandHandler>> _mockLogger = new();

    #region Validator Tests

    [Fact]
    public void Validator_WhenRequiredIdsEmpty_FailsValidation()
    {
        var validator = new AdminUpdateApplicantProfileCommandValidator();

        var result = validator.Validate(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = Guid.Empty,
            ApplicantId = Guid.Empty
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicationId");
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicantId");
    }

    [Fact]
    public void Validator_WhenEmailsAreInvalid_FailsValidation()
    {
        var validator = new AdminUpdateApplicantProfileCommandValidator();

        var result = validator.Validate(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            Email = "not-an-email",
            CompanyEmail = "also-invalid"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
        result.Errors.Should().Contain(e => e.PropertyName == "CompanyEmail");
    }

    [Fact]
    public void Validator_WhenDobInvalid_FailsValidation()
    {
        var validator = new AdminUpdateApplicantProfileCommandValidator();

        var result = validator.Validate(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            Dob = "invalid-date"
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Dob");
    }

    [Fact]
    public void Validator_WhenValidData_PassesValidation()
    {
        var validator = new AdminUpdateApplicantProfileCommandValidator();

        var result = validator.Validate(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            Email = "test@domain.com",
            CompanyEmail = "corp@domain.com",
            Dob = "1990-05-15"
        });

        result.IsValid.Should().BeTrue();
    }

    #endregion

    #region Handler Tests

    [Fact]
    public async Task Handle_WhenApplicationNotFound_ReturnsFail()
    {
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var handler = new AdminUpdateApplicantProfileCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var result = await handler.Handle(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId
        }, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Application with ID {appId} was not found");
    }

    [Fact]
    public async Task Handle_WhenApplicantNotFoundOnApplication_ReturnsFail()
    {
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var otherApplicantId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new() { ApplicantId = otherApplicantId, Applicant = new Applicant { Id = otherApplicantId } },
                new() { ApplicantId = Guid.NewGuid(), Applicant = new Applicant { Id = Guid.NewGuid() } }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new AdminUpdateApplicantProfileCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var result = await handler.Handle(new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId
        }, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Applicant with ID {applicantId} was not found");
    }

    [Fact]
    public async Task Handle_WhenValidProfileUpdates_LogsCorrectionAuditsAndUpdatesApplicant()
    {
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            ApplicantDetail = new ApplicantDetail
            {
                Id = Guid.NewGuid(),
                FirstName = "OldFirst",
                LastName = "OldLast",
                EmailAddress = "old@example.com"
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new() { ApplicantId = applicantId, Applicant = applicant }
            }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        _mockCurrentUserService.Setup(c => c.UserId).Returns("officer-123");

        var handler = new AdminUpdateApplicantProfileCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var command = new AdminUpdateApplicantProfileCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            FirstName = "NewFirst",
            LastName = "NewLast",
            Email = "new@example.com"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(applicantId);

        // Verification of changes
        applicant.ApplicantDetail.FirstName.Should().Be("NewFirst");
        applicant.ApplicantDetail.LastName.Should().Be("NewLast");
        applicant.ApplicantDetail.EmailAddress.Should().Be("new@example.com");

        // Verify audit trails logged for changed fields
        _mockAppRepo.Verify(r => r.AddCorrectionAuditTrailAsync(
            It.Is<CorrectionAuditTrail>(c => c.ApplicationId == appId && c.Category == "Applicant Profile"),
            It.IsAny<CancellationToken>()), Times.AtLeast(3));

        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
