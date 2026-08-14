using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.GenerateSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class GenerateSoaCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _applicationRepositoryMock = new();
    private readonly Mock<IServiceFeeRepository> _serviceFeeRepositoryMock = new();
    private readonly Mock<IServiceVariantFeeRepository> _serviceVariantFeeRepositoryMock = new();
    private readonly Mock<IServiceVariantElementFeeRepository> _serviceVariantElementFeeRepositoryMock = new();
    private readonly Mock<IElementRepository> _elementRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly GenerateSoaCommandHandler _handler;

    public GenerateSoaCommandHandlerTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(Guid.NewGuid(), "Jane Evaluator", defaultRole));

        _handler = new GenerateSoaCommandHandler(
            _applicationRepositoryMock.Object,
            _serviceFeeRepositoryMock.Object,
            _serviceVariantFeeRepositoryMock.Object,
            _serviceVariantElementFeeRepositoryMock.Object,
            _elementRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        var command = new GenerateSoaCommand(Guid.NewGuid());
        _applicationRepositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(command.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Application not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicantsAreIncomplete()
    {
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            Status = ApplicantStatus.Incomplete
        };
        app.ApplicationApplicants.Add(new ApplicationApplicant
        {
            ApplicationId = app.Id,
            ApplicantId = applicant.Id,
            Applicant = applicant
        });

        _applicationRepositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var result = await _handler.Handle(new GenerateSoaCommand(app.Id), CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("All applicants must have status 'Complete'");
    }

    [Fact]
    public async Task Handle_ShouldGenerateSoaWithConfiguredFees_WhenFeesExist()
    {
        var serviceId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var elementId = Guid.NewGuid();

        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            Status = ApplicantStatus.Complete,
            ServiceId = serviceId,
            ServiceVariantId = variantId,
            ApplicantType = ApplicantType.Individual,
            ApplicantDetail = new ApplicantDetail
            {
                FirstName = "Juan",
                LastName = "Dela Cruz",
                Address = "123 Main St, Manila"
            }
        };

        var formSubmission = new FormSubmission
        {
            Id = Guid.NewGuid(),
            ApplicantId = applicant.Id,
            FieldValues = new List<FormFieldValue>
            {
                new() { Value = "1RTG-STD", CustomLabel = "Exam Element" }
            }
        };
        applicant.FormSubmission = formSubmission;

        app.ApplicationApplicants.Add(new ApplicationApplicant
        {
            ApplicationId = app.Id,
            ApplicantId = applicant.Id,
            Applicant = applicant
        });

        _applicationRepositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Mock Service Fee
        var serviceFee = new ServiceFee
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            Amount = 500m,
            IsActive = true,
            Fee = new Fee { Code = "SRV-01", Name = "Filing Fee" }
        };
        _serviceFeeRepositoryMock
            .Setup(r => r.GetAllAsync(serviceId, null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceFee> { serviceFee });

        // Mock Variant Fee
        var variantFee = new ServiceVariantFee
        {
            Id = Guid.NewGuid(),
            ServiceVariantId = variantId,
            Amount = 300m,
            Fee = new Fee { Code = "VAR-01", Name = "Processing Fee" }
        };
        _serviceVariantFeeRepositoryMock
            .Setup(r => r.GetByServiceVariantIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantFee> { variantFee });

        // Mock Element Fee
        var elementFee = new ServiceVariantElementFee
        {
            Id = Guid.NewGuid(),
            ServiceVariantId = variantId,
            ElementId = elementId,
            Amount = 200m,
            Element = new Element { Id = elementId, Code = "1RTG-STD", Name = "1RTG Standard" },
            Fee = new Fee { Code = "ELEM-01", Name = "Exam Element Fee" }
        };
        _serviceVariantElementFeeRepositoryMock
            .Setup(r => r.GetByServiceVariantIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantElementFee> { elementFee });

        StatementOfAccount? createdSoa = null;
        _applicationRepositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => createdSoa = s)
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(new GenerateSoaCommand(app.Id), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        createdSoa.Should().NotBeNull();
        createdSoa!.ApplicantId.Should().Be(applicant.Id);
        createdSoa.IssuedToName.Should().Be("Juan Dela Cruz");
        createdSoa.LineItems.Should().HaveCount(3);
        createdSoa.TotalAmount.Should().Be(1000m); // 500 + 300 + 200
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldGenerateSoaWithZeroItems_WhenNoMatchingFeesExist()
    {
        var serviceId = Guid.NewGuid();
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            Status = ApplicantStatus.Complete,
            ServiceId = serviceId,
            ApplicantType = ApplicantType.Individual,
            ApplicantDetail = new ApplicantDetail
            {
                FirstName = "Maria",
                LastName = "Clara"
            }
        };

        app.ApplicationApplicants.Add(new ApplicationApplicant
        {
            ApplicationId = app.Id,
            ApplicantId = applicant.Id,
            Applicant = applicant
        });

        _applicationRepositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _serviceFeeRepositoryMock
            .Setup(r => r.GetAllAsync(serviceId, null, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceFee>());

        StatementOfAccount? createdSoa = null;
        _applicationRepositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => createdSoa = s)
            .Returns(Task.CompletedTask);

        var result = await _handler.Handle(new GenerateSoaCommand(app.Id), CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        createdSoa.Should().NotBeNull();
        createdSoa!.LineItems.Should().BeEmpty();
        createdSoa.TotalAmount.Should().Be(0m);
    }
}
