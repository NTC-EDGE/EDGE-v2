using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
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
            _mockUserRepo.Object
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
}
