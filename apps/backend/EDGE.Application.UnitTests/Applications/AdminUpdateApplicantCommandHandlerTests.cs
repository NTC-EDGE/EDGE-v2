using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.AdminUpdateApplicant;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class AdminUpdateApplicantCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ILogger<AdminUpdateApplicantCommandHandler>> _loggerMock = new();
    private readonly AdminUpdateApplicantCommandHandler _handler;

    public AdminUpdateApplicantCommandHandlerTests()
    {
        _currentUserServiceMock.Setup(s => s.UserId).Returns("evaluator-user-123");

        _handler = new AdminUpdateApplicantCommandHandler(
            _repositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = Guid.NewGuid(),
            ApplicantId = Guid.NewGuid(),
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(command.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicantNotFoundOnApplication()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var targetApplicantId = Guid.NewGuid();
        var otherApplicantId = Guid.NewGuid();

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { ApplicationId = appId, ApplicantId = otherApplicantId, Applicant = new Applicant { Id = otherApplicantId } }
            }
        };

        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = appId,
            ApplicantId = targetApplicantId,
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found on this application");
    }

    [Fact]
    public async Task Handle_ShouldUpdateRootDetailsAndProfileAndLogAudits()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var detailId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = Guid.NewGuid(),
            ApplicantType = ApplicantType.Individual,
            Status = ApplicantStatus.Incomplete,
            EvaluationRemarks = "Pending verification",
            ApplicantDetailId = detailId,
            ApplicantDetail = new ApplicantDetail
            {
                Id = detailId,
                FirstName = "Juan",
                LastName = "Dela Cruz",
                MiddleName = "OldMiddle",
                ContactNumber = "09111111111",
                EmailAddress = "old@example.com",
                Address = "Old Address",
                BirthDate = new DateOnly(1990, 1, 1),
                Sex = "Male",
                Nationality = "Filipino"
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { ApplicationId = appId, ApplicantId = applicantId, Applicant = applicant }
            }
        };

        var loggedAudits = new List<CorrectionAuditTrail>();
        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _repositoryMock
            .Setup(r => r.AddCorrectionAuditTrailAsync(It.IsAny<CorrectionAuditTrail>(), It.IsAny<CancellationToken>()))
            .Callback<CorrectionAuditTrail, CancellationToken>((audit, _) => loggedAudits.Add(audit))
            .Returns(Task.CompletedTask);

        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            Status = "Complete",
            EvaluationRemarks = "All docs verified.",
            Details = new AdminUpdateApplicantDetailDto
            {
                FirstName = "Juanito",
                LastName = "Dela Cruz", // unchanged
                MiddleName = "NewMiddle",
                ContactNumber = "09222222222",
                EmailAddress = "new@example.com",
                Address = "New Address 123",
                BirthDate = new DateOnly(1995, 5, 20),
                Height = 175.5,
                Weight = 70.0
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Status.Should().Be("Complete");
        result.Data.EvaluationRemarks.Should().Be("All docs verified.");
        result.Data.Details.Should().NotBeNull();
        result.Data.Details!.FirstName.Should().Be("Juanito");
        result.Data.Details.MiddleName.Should().Be("NewMiddle");
        result.Data.Details.ContactNumber.Should().Be("09222222222");
        result.Data.Details.EmailAddress.Should().Be("new@example.com");
        result.Data.Details.Address.Should().Be("New Address 123");
        result.Data.Details.BirthDate.Should().Be(new DateOnly(1995, 5, 20));
        result.Data.Details.Height.Should().Be(175.5);
        result.Data.Details.Weight.Should().Be(70.0);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);

        loggedAudits.Should().Contain(a => a.FieldName == "Status" && a.OldValue == "Incomplete" && a.NewValue == "Complete");
        loggedAudits.Should().Contain(a => a.FieldName == "EvaluationRemarks" && a.NewValue == "All docs verified.");
        loggedAudits.Should().Contain(a => a.FieldName == "FirstName" && a.OldValue == "Juan" && a.NewValue == "Juanito");
        loggedAudits.Should().Contain(a => a.FieldName == "MiddleName" && a.OldValue == "OldMiddle" && a.NewValue == "NewMiddle");
        loggedAudits.Should().Contain(a => a.FieldName == "ContactNumber" && a.NewValue == "09222222222");
        loggedAudits.Should().Contain(a => a.FieldName == "EmailAddress" && a.NewValue == "new@example.com");
    }

    [Fact]
    public async Task Handle_ShouldUpdateCompanyDetailsAndLogAudits()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = Guid.NewGuid(),
            ApplicantType = ApplicantType.Company,
            Status = ApplicantStatus.Incomplete,
            CompanyDetail = new CompanyDetail
            {
                Id = Guid.NewGuid(),
                Name = "Old Corp",
                RegistrationNumber = "SEC000",
                Address = "Old Business Addr",
                ContactNumber = "020000000",
                Email = "old@corp.com"
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { ApplicationId = appId, ApplicantId = applicantId, Applicant = applicant }
            }
        };

        var loggedAudits = new List<CorrectionAuditTrail>();
        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _repositoryMock
            .Setup(r => r.AddCorrectionAuditTrailAsync(It.IsAny<CorrectionAuditTrail>(), It.IsAny<CancellationToken>()))
            .Callback<CorrectionAuditTrail, CancellationToken>((audit, _) => loggedAudits.Add(audit))
            .Returns(Task.CompletedTask);

        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            Company = new AdminUpdateCompanyDetailDto
            {
                Name = "New Acme Solutions Inc.",
                RegistrationNumber = "SEC99999",
                Address = "New Corporate Hub",
                ContactNumber = "0288888888",
                Email = "info@acme.com",
                EntityType = "Corporation"
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Company.Should().NotBeNull();
        result.Data.Company!.Name.Should().Be("New Acme Solutions Inc.");
        result.Data.Company.RegistrationNumber.Should().Be("SEC99999");
        result.Data.Company.Address.Should().Be("New Corporate Hub");
        result.Data.Company.ContactNumber.Should().Be("0288888888");
        result.Data.Company.Email.Should().Be("info@acme.com");
        result.Data.Company.EntityType.Should().Be("Corporation");

        loggedAudits.Should().Contain(a => a.FieldName == "CompanyName" && a.OldValue == "Old Corp" && a.NewValue == "New Acme Solutions Inc.");
        loggedAudits.Should().Contain(a => a.FieldName == "RegistrationNumber" && a.OldValue == "SEC000" && a.NewValue == "SEC99999");
    }

    [Fact]
    public async Task Handle_ShouldSucceed_WhenPayloadHasCompanyTypeAndEmptyCompanyFields()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var detailId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            TenantId = Guid.NewGuid(),
            ApplicantType = ApplicantType.Individual,
            Status = ApplicantStatus.Incomplete,
            ApplicantDetailId = detailId,
            ApplicantDetail = new ApplicantDetail
            {
                Id = detailId,
                FirstName = "Juan",
                LastName = "Santos",
                MiddleName = "Cruz",
                Address = "Cebu City, Cebu",
                ContactNumber = "09171234567",
                EmailAddress = "juan.santos@email.com",
                BirthDate = new DateOnly(1990, 3, 15),
                Sex = "Male",
                Nationality = "Filipino"
            }
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { ApplicationId = appId, ApplicantId = applicantId, Applicant = applicant }
            }
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var command = new AdminUpdateApplicantCommand
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            ApplicantType = "Company",
            Details = new AdminUpdateApplicantDetailDto
            {
                FirstName = "Juan",
                LastName = "Santos",
                MiddleName = "Cruz",
                Suffix = "",
                ContactNumber = "09171234567",
                EmailAddress = "juan.santos@email.com",
                Address = "Cebu City, Cebu",
                ZipCode = "6000",
                Dob = "1990-03-15",
                Sex = "Male",
                Nationality = "Filipino"
            },
            Company = new AdminUpdateCompanyDetailDto
            {
                Name = "",
                RegistrationNumber = "",
                Address = "",
                ContactNumber = "",
                Email = ""
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.ApplicantType.Should().Be("Company");
        result.Data.Details.Should().NotBeNull();
        result.Data.Details!.FirstName.Should().Be("Juan");
        result.Data.Details.LastName.Should().Be("Santos");
    }
}
