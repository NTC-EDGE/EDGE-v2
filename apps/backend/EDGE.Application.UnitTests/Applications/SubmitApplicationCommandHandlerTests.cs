using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.SubmitApplication;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class SubmitApplicationCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockApplicationRepo;
    private readonly Mock<IApplicantRepository> _mockApplicantRepo;
    private readonly Mock<IServiceRepository> _mockServiceRepo;
    private readonly Mock<IFormRepository> _mockFormRepo;
    private readonly Mock<IFieldOfficeRepository> _mockFieldOfficeRepo;
    private readonly Mock<ITenantRepository> _mockTenantRepo;
    private readonly Mock<IScheduleRepository> _mockScheduleRepo;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IServiceVariantElementRepository> _mockElementRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IUserAuthorizationService> _mockUserAuthService;
    private readonly Mock<ILogger<SubmitApplicationCommandHandler>> _mockLogger;
    private readonly SubmitApplicationCommandHandler _handler;

    public SubmitApplicationCommandHandlerTests()
    {
        _mockApplicationRepo = new Mock<IApplicationFullRepository>();
        _mockApplicantRepo = new Mock<IApplicantRepository>();
        _mockServiceRepo = new Mock<IServiceRepository>();
        _mockFormRepo = new Mock<IFormRepository>();
        _mockFieldOfficeRepo = new Mock<IFieldOfficeRepository>();
        _mockTenantRepo = new Mock<ITenantRepository>();
        _mockScheduleRepo = new Mock<IScheduleRepository>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockElementRepo = new Mock<IServiceVariantElementRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockUserAuthService = new Mock<IUserAuthorizationService>();
        _mockLogger = new Mock<ILogger<SubmitApplicationCommandHandler>>();

        _mockUserAuthService.Setup(a => a.CanSubmitApplicationAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _handler = new SubmitApplicationCommandHandler(
            _mockApplicationRepo.Object,
            _mockApplicantRepo.Object,
            _mockServiceRepo.Object,
            _mockFormRepo.Object,
            _mockFieldOfficeRepo.Object,
            _mockTenantRepo.Object,
            _mockScheduleRepo.Object,
            _mockUnitOfWork.Object,
            _mockCurrentUserService.Object,
            _mockElementRepo.Object,
            _mockUserRepo.Object,
            _mockUserAuthService.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task Handle_BulkModeWithSingleApplicant_CorrectlySavesBulkApplicationAndCompanyApplicant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var regionId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = regionId, Name = "NCR Regional Office" });

        var service = new Service
        {
            Id = serviceId,
            Name = "Radio Operator Exam",
            Contract = "{\"allowsBulkSubmission\":true}"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        Domain.Entities.Application? capturedApplication = null;
        _mockApplicationRepo.Setup(a => a.AddAsync(It.IsAny<Domain.Entities.Application>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.Entities.Application, CancellationToken>((app, _) => capturedApplication = app)
            .Returns(Task.CompletedTask);

        Applicant? capturedApplicant = null;
        _mockApplicantRepo.Setup(a => a.AddApplicantAsync(It.IsAny<Applicant>(), It.IsAny<CancellationToken>()))
            .Callback<Applicant, CancellationToken>((app, _) => capturedApplicant = app)
            .Returns(Task.CompletedTask);

        ApplicationApplicant? capturedAppApplicant = null;
        _mockApplicationRepo.Setup(a => a.AddApplicationApplicantAsync(It.IsAny<ApplicationApplicant>(), It.IsAny<CancellationToken>()))
            .Callback<ApplicationApplicant, CancellationToken>((aa, _) => capturedAppApplicant = aa)
            .Returns(Task.CompletedTask);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new ApplicantSubmissionDto
                {
                    FirstName = "Jane",
                    LastName = "Doe",
                    Email = "jane@example.com",
                    ContactNumber = "09171234567",
                    Address = "123 Main St",
                    BirthDate = new DateOnly(1995, 5, 20),
                    FormFieldValues = new List<FormFieldValueSubmissionDto>()
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Message.Should().Be("Application submitted successfully.");

        // Downstream logic assertions:
        capturedApplication.Should().NotBeNull();
        capturedApplication!.SubmissionMode.Should().Be(SubmissionMode.Bulk);
        capturedApplication.Status.Should().Be(ApplicationStatus.Submitted);
        capturedApplication.ApplicationNumber.Should().StartWith("APP-");
        capturedApplication.RegionId.Should().Be(regionId);

        capturedApplicant.Should().NotBeNull();
        capturedApplicant!.ApplicantType.Should().Be(ApplicantType.Company, "Bulk submissions should designate applicant as Company");
        capturedApplicant.Status.Should().Be(ApplicantStatus.Complete);

        capturedAppApplicant.Should().NotBeNull();
        capturedAppApplicant!.SequenceOrder.Should().Be(1);

        _mockUnitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SingleModeWithSingleApplicant_SavesSingleApplicationAndIndividualApplicant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var regionId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns((string?)null);
        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = regionId, Name = "Region 7" });

        var service = new Service
        {
            Id = serviceId,
            Name = "CPE Accreditation"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        Domain.Entities.Application? capturedApplication = null;
        _mockApplicationRepo.Setup(a => a.AddAsync(It.IsAny<Domain.Entities.Application>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.Entities.Application, CancellationToken>((app, _) => capturedApplication = app)
            .Returns(Task.CompletedTask);

        Applicant? capturedApplicant = null;
        _mockApplicantRepo.Setup(a => a.AddApplicantAsync(It.IsAny<Applicant>(), It.IsAny<CancellationToken>()))
            .Callback<Applicant, CancellationToken>((app, _) => capturedApplicant = app)
            .Returns(Task.CompletedTask);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new ApplicantSubmissionDto
                {
                    FirstName = "John",
                    LastName = "Smith",
                    Email = "john@example.com",
                    ContactNumber = "09171234567",
                    FormFieldValues = new List<FormFieldValueSubmissionDto>()
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        capturedApplication.Should().NotBeNull();
        capturedApplication!.SubmissionMode.Should().Be(SubmissionMode.Single);
        capturedApplication.IsGuest.Should().BeTrue();

        capturedApplicant.Should().NotBeNull();
        capturedApplicant!.ApplicantType.Should().Be(ApplicantType.Individual);
    }

    [Fact]
    public async Task Handle_BulkSubmissionWhenServiceDisallowsBulk_ReturnsValidationError()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = Guid.NewGuid() });

        var service = new Service
        {
            Id = serviceId,
            Name = "Single Only Service",
            Contract = "{\"allowsBulkSubmission\":false}"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            SubmissionMode = "Bulk",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new ApplicantSubmissionDto
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john@example.com",
                    ContactNumber = "09171234567",
                    FormFieldValues = new List<FormFieldValueSubmissionDto>()
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("This service does not allow bulk submission.");
        _mockApplicationRepo.Verify(a => a.AddAsync(It.IsAny<Domain.Entities.Application>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserLacksSubmitPermission_ReturnsForbiddenError()
    {
        // Arrange
        _mockUserAuthService.Setup(a => a.CanSubmitApplicationAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new SubmitApplicationCommand
        {
            TenantId = Guid.NewGuid(),
            ServiceId = Guid.NewGuid(),
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new ApplicantSubmissionDto
                {
                    FirstName = "Internal",
                    LastName = "Staff",
                    Email = "staff@example.com"
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("403 Forbidden");
        result.Message.Should().Contain("internal staff account does not have permission to submit service applications");
        _mockApplicationRepo.Verify(a => a.AddAsync(It.IsAny<Domain.Entities.Application>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockUnitOfWork.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CompanyApplicantWithStructuredRepresentative_SavesStructuredApplicantDetailAndCompanyDetail()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var regionId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns((string?)null);
        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = regionId, Name = "Region 7" });

        var service = new Service
        {
            Id = serviceId,
            Name = "CPE Accreditation"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        ApplicantDetail? capturedDetail = null;
        _mockApplicantRepo.Setup(a => a.AddApplicantDetailAsync(It.IsAny<ApplicantDetail>(), It.IsAny<CancellationToken>()))
            .Callback<ApplicantDetail, CancellationToken>((d, _) => capturedDetail = d)
            .Returns(Task.CompletedTask);

        CompanyDetail? capturedCompany = null;
        _mockApplicantRepo.Setup(a => a.AddCompanyDetailAsync(It.IsAny<CompanyDetail>(), It.IsAny<CancellationToken>()))
            .Callback<CompanyDetail, CancellationToken>((c, _) => capturedCompany = c)
            .Returns(Task.CompletedTask);

        Applicant? capturedApplicant = null;
        _mockApplicantRepo.Setup(a => a.AddApplicantAsync(It.IsAny<Applicant>(), It.IsAny<CancellationToken>()))
            .Callback<Applicant, CancellationToken>((app, _) => capturedApplicant = app)
            .Returns(Task.CompletedTask);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new ApplicantSubmissionDto
                {
                    ApplicantType = "Company",
                    CompanyName = "Globe Telecom Inc.",
                    DtiSecRegistration = "SEC-CS201912345",
                    FirstName = "Juan",
                    MiddleName = "Protacio",
                    LastName = "Dela Cruz",
                    Suffix = "Jr.",
                    Email = "representative@globe.com.ph",
                    ContactNumber = "09171234567",
                    Address = "123 Ayala Ave, Makati City",
                    BirthDate = new DateOnly(1985, 6, 15),
                    FormFieldValues = new List<FormFieldValueSubmissionDto>()
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();

        capturedDetail.Should().NotBeNull();
        capturedDetail!.FirstName.Should().Be("Juan");
        capturedDetail.MiddleName.Should().Be("Protacio");
        capturedDetail.LastName.Should().Be("Dela Cruz");
        capturedDetail.Suffix.Should().Be("Jr.");
        capturedDetail.EmailAddress.Should().Be("representative@globe.com.ph");
        capturedDetail.ContactNumber.Should().Be("09171234567");
        capturedDetail.Address.Should().Be("123 Ayala Ave, Makati City");
        capturedDetail.BirthDate.Should().Be(new DateOnly(1985, 6, 15));

        capturedCompany.Should().NotBeNull();
        capturedCompany!.Name.Should().Be("Globe Telecom Inc.");
        capturedCompany.RegistrationNumber.Should().Be("SEC-CS201912345");

        capturedApplicant.Should().NotBeNull();
        capturedApplicant!.ApplicantType.Should().Be(ApplicantType.Company);
        capturedApplicant.ApplicantDetailId.Should().Be(capturedDetail.Id);
        capturedApplicant.CompanyDetailId.Should().Be(capturedCompany.Id);
    }

    [Fact]
    public async Task Handle_WhenExceptionThrown_LogsCriticalStackTraceAndReturnsSanitizedResponse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var regionId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = regionId, Name = "NCR Regional Office" });

        var service = new Service
        {
            Id = serviceId,
            Name = "Radio Operator Exam"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        var expectedException = new InvalidOperationException("Internal database constraint failed: Npgsql.PostgresException: duplicate key value violates unique constraint 'IX_Applications_Number'");
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new()
                {
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john@example.com",
                    ContactNumber = "09171234567"
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().NotContain("Npgsql.PostgresException");
        result.Message.Should().NotContain("IX_Applications_Number");
        result.Message.Should().Be("An unexpected error occurred while saving the application. Please try again later.");

        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.Is<Exception>(e => e == expectedException),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ResubmitReturnedApplication_PreservesExistingApplicantAndRetainsAttachedRequirements()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var regionId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var existingAppId = Guid.NewGuid();
        var existingApplicantId = Guid.NewGuid();
        var existingDetailId = Guid.NewGuid();

        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());
        _mockTenantRepo.Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Tenant { Id = tenantId, RegionId = regionId, Name = "NCR Regional Office" });

        var service = new Service
        {
            Id = serviceId,
            Name = "Radio Operator Exam",
            Contract = "{\"allowsBulkSubmission\":false}"
        };
        _mockServiceRepo.Setup(s => s.GetByIdAsync(serviceId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(service);

        var existingApplicantDetail = new ApplicantDetail
        {
            Id = existingDetailId,
            FirstName = "Original",
            LastName = "Name",
            EmailAddress = "original@example.com",
            ContactNumber = "09171234567"
        };

        var existingApplicant = new Applicant
        {
            Id = existingApplicantId,
            TenantId = tenantId,
            ApplicantDetailId = existingDetailId,
            ApplicantDetail = existingApplicantDetail,
            Status = ApplicantStatus.Incomplete
        };

        var existingAppApplicant = new ApplicationApplicant
        {
            Id = Guid.NewGuid(),
            ApplicationId = existingAppId,
            ApplicantId = existingApplicantId,
            Applicant = existingApplicant,
            SequenceOrder = 1
        };

        var attachedRequirement = new ApplicationRequirement
        {
            Id = Guid.NewGuid(),
            ApplicationId = existingAppId,
            ApplicantId = existingAppId, // legacy/appId association
            RequirementId = Guid.NewGuid()
        };

        var existingApp = new Domain.Entities.Application
        {
            Id = existingAppId,
            TenantId = tenantId,
            Status = ApplicationStatus.Returned,
            ReferenceNumber = "REF-RET-1234",
            ApplicationNumber = "APP-2026-1234",
            SubmissionMode = SubmissionMode.Single,
            ApplicationApplicants = new List<ApplicationApplicant> { existingAppApplicant },
            ApplicationRequirements = new List<ApplicationRequirement> { attachedRequirement }
        };

        _mockApplicationRepo.Setup(a => a.GetByIdWithDetailsAsync(existingAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingApp);
        _mockApplicationRepo.Setup(a => a.GetByIdAsync(existingAppId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingApp);

        var command = new SubmitApplicationCommand
        {
            TenantId = tenantId,
            ServiceId = serviceId,
            ExistingDraftId = existingAppId,
            SubmissionMode = "Single",
            IsDraft = false,
            Applicants = new List<ApplicantSubmissionDto>
            {
                new()
                {
                    FirstName = "Amended",
                    LastName = "Name",
                    Email = "amended@example.com",
                    ContactNumber = "09179876543"
                }
            }
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().Be(existingAppId);

        // Verified that existing application was updated, not added as a new entity
        _mockApplicationRepo.Verify(a => a.AddAsync(It.IsAny<Domain.Entities.Application>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockApplicationRepo.Verify(a => a.UpdateAsync(It.Is<Domain.Entities.Application>(app => app.Id == existingAppId && app.Status == ApplicationStatus.Submitted), It.IsAny<CancellationToken>()), Times.Once);

        // Verified that existing applicant ID was preserved and updated
        _mockApplicantRepo.Verify(a => a.AddApplicantAsync(It.IsAny<Applicant>(), It.IsAny<CancellationToken>()), Times.Never);
        _mockApplicantRepo.Verify(a => a.UpdateApplicant(It.Is<Applicant>(a => a.Id == existingApplicantId && a.Status == ApplicantStatus.Complete)), Times.Once);
        _mockApplicantRepo.Verify(a => a.UpdateApplicantDetail(It.Is<ApplicantDetail>(d => d.Id == existingDetailId && d.FirstName == "Amended")), Times.Once);

        // Verified that attached requirement was updated to link to the applicant ID
        _mockApplicationRepo.Verify(a => a.UpdateApplicationRequirementAsync(It.Is<ApplicationRequirement>(r => r.ApplicantId == existingApplicantId), It.IsAny<CancellationToken>()), Times.Once);
    }
}
