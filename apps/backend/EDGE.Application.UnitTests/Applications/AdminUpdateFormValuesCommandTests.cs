using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.AdminUpdateFormValues;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class AdminUpdateFormValuesCommandTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo = new();
    private readonly Mock<ICurrentUserService> _mockCurrentUserService = new();
    private readonly Mock<IUnitOfWork> _mockUnitOfWork = new();
    private readonly Mock<ILogger<AdminUpdateFormValuesCommandHandler>> _mockLogger = new();

    #region Validator Tests

    [Fact]
    public void Validator_WhenRequiredFieldsMissing_FailsValidation()
    {
        var validator = new AdminUpdateFormValuesCommandValidator();

        var result = validator.Validate(new AdminUpdateFormValuesCommand
        {
            ApplicationId = Guid.Empty,
            ApplicantId = Guid.Empty,
            FormFields = null!
        });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicationId");
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicantId");
        result.Errors.Should().Contain(e => e.PropertyName == "FormFields");
    }

    [Fact]
    public void Validator_WhenValidCommand_PassesValidation()
    {
        var validator = new AdminUpdateFormValuesCommandValidator();

        var result = validator.Validate(new AdminUpdateFormValuesCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
            FormFields = new List<AdminFormFieldValueDto>
            {
                new(Guid.NewGuid().ToString(), "Callsign", "DY999")
            }
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

        var handler = new AdminUpdateFormValuesCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var result = await handler.Handle(new AdminUpdateFormValuesCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            FormFields = new List<AdminFormFieldValueDto>()
        }, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain($"Application with ID {appId} was not found");
    }

    [Fact]
    public async Task Handle_WhenFormSubmissionNotFound_ReturnsFail()
    {
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            FormSubmissions = new List<FormSubmission>() // Empty submissions
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);

        var handler = new AdminUpdateFormValuesCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var result = await handler.Handle(new AdminUpdateFormValuesCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            FormFields = new List<AdminFormFieldValueDto>()
        }, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("No matching form submission found");
    }

    [Fact]
    public async Task Handle_WhenUpdatingFormFields_AuditsChangesAndSavesSubmission()
    {
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var submissionId = Guid.NewGuid();
        var fieldId1 = Guid.NewGuid();
        var fieldId2 = Guid.NewGuid();

        var submission = new FormSubmission
        {
            Id = submissionId,
            ApplicationId = appId,
            ApplicantId = applicantId,
            FieldValues = new List<FormFieldValue>
            {
                new()
                {
                    FieldId = fieldId1,
                    Value = "DY123",
                    Field = new Field { Label = "Callsign" }
                }
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            FormSubmissions = new List<FormSubmission> { submission }
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>())).ReturnsAsync(app);
        _mockCurrentUserService.Setup(c => c.UserId).Returns("officer-456");

        var handler = new AdminUpdateFormValuesCommandHandler(
            _mockAppRepo.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object, _mockLogger.Object);

        var command = new AdminUpdateFormValuesCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            SubmissionId = submissionId,
            FormFields = new List<AdminFormFieldValueDto>
            {
                new(fieldId1.ToString(), "Callsign", "DY999"),
                new(fieldId2.ToString(), "Frequency", "145.5")
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(applicantId);

        _mockAppRepo.Verify(r => r.AddCorrectionAuditTrailAsync(
            It.Is<CorrectionAuditTrail>(c => c.ApplicationId == appId && c.Category == "Form Submissions"),
            It.IsAny<CancellationToken>()), Times.Exactly(2));

        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);

        // Verify updated values
        var updatedField1 = submission.FieldValues.First(fv => fv.FieldId == fieldId1);
        updatedField1.Value.Should().Be("DY999");

        var newField2 = submission.FieldValues.First(fv => fv.FieldId == fieldId2);
        newField2.Value.Should().Be("145.5");
    }

    #endregion
}
