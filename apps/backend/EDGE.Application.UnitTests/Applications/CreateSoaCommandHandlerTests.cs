using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Commands.CreateSoa;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Fees.Calculations;
using EDGE.Application.Fees.Calculations.Strategies;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class CreateSoaCommandHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IServiceFeeRepository> _serviceFeeRepositoryMock = new();
    private readonly Mock<IServiceVariantFeeRepository> _variantFeeRepositoryMock = new();
    private readonly Mock<IServiceVariantElementFeeRepository> _elementFeeRepositoryMock = new();
    private readonly Mock<IServiceVariantFormulaRepository> _formulaRepositoryMock = new();
    private readonly FeeCalculationEngine _calculationEngine = new(new IFeeCalculationStrategy[]
    {
        new CertificateFeeCalculationStrategy(),
        new LicenseFeeCalculationStrategy(),
        new PermitFeeCalculationStrategy(),
        new ExamFeeCalculationStrategy(),
        new AccreditationFeeCalculationStrategy(),
        new RequestsAndComplaintsFeeCalculationStrategy(),
        new DefaultFeeCalculationStrategy()
    });
    private readonly CreateSoaCommandHandler _handler;

    public CreateSoaCommandHandlerTests()
    {
        _userRepositoryMock
            .Setup(u => u.GetStaffUserContextAsync(It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string? id, string defaultRole, CancellationToken _) => new StaffUserContext(null, "Test Staff", defaultRole));

        _handler = new CreateSoaCommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object,
            _currentUserServiceMock.Object,
            _userRepositoryMock.Object,
            _calculationEngine,
            _serviceFeeRepositoryMock.Object,
            _variantFeeRepositoryMock.Object,
            _elementFeeRepositoryMock.Object,
            _formulaRepositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var command = new CreateSoaCommand(
            Guid.NewGuid(),
            null,
            "Individual",
            "John Doe",
            "123 Main St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest>());

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(command.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Application not found.");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotEvaluating()
    {
        // Arrange
        var app = new Domain.Entities.Application { Id = Guid.NewGuid(), Status = ApplicationStatus.Submitted };
        var command = new CreateSoaCommand(
            app.Id,
            null,
            "Individual",
            "John Doe",
            "123 Main St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest>());

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("only be generated when the application is under active evaluation");
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenIssuedToTypeInvalid()
    {
        // Arrange
        var app = new Domain.Entities.Application { Id = Guid.NewGuid(), Status = ApplicationStatus.Evaluating };
        var command = new CreateSoaCommand(
            app.Id,
            null,
            "InvalidType",
            "John Doe",
            "123 Main St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest>());

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Invalid IssuedToType.");
    }

    [Fact]
    public async Task Handle_ShouldCreateSoa_AndRecalculateAmountsServerSide_WhenValidExplicitLineItemsProvided()
    {
        // Arrange
        var app = new Domain.Entities.Application { Id = Guid.NewGuid(), Status = ApplicationStatus.Evaluating };
        var lineItem1 = new CreateSoaLineItemRequest("Processing Fee", "FEE-01", "Desc", null, null, 1, 2, 500m, 9999m); // client provided wrong amount 9999m
        var lineItem2 = new CreateSoaLineItemRequest("Filing Fee", "FEE-02", "Desc", null, null, 1, 1, 300m, 0m);

        var command = new CreateSoaCommand(
            app.Id,
            null,
            "Company",
            "Acme Corp",
            "456 Market St",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest> { lineItem1, lineItem2 });

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        StatementOfAccount? savedSoa = null;
        _repositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => savedSoa = s)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedSoa.Should().NotBeNull();
        savedSoa!.IssuedToName.Should().Be("Acme Corp");
        savedSoa.IssuedToType.Should().Be(IssuedToType.Company);

        // Verify Server-Side Fee Recalculation:
        // Item 1: 2 units * 500 = 1000 (overrides client 9999)
        // Item 2: 1 unit * 300 = 300
        // Total = 1300
        savedSoa.LineItems.Should().HaveCount(2);
        savedSoa.TotalAmount.Should().Be(1300m);
        savedSoa.Histories.Should().HaveCount(1);
        savedSoa.Histories.First().ToStatus.Should().Be(SoaStatus.Pending);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldAutoCalculateStatutorySoa_WhenLineItemsAreOmitted()
    {
        // Arrange
        var serviceCategory = new ServiceCategory { Name = "Certificates", Code = "CERT", Type = ServiceCategoryType.Certificate };
        var service = new Service { Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", ServiceCategory = serviceCategory };
        var serviceVariant = new ServiceVariant { Description = "Commercial Radio Operator Certificate (NEW)", Type = ServiceVariantType.New };
        serviceVariant.ServiceVariantElements.Add(new ServiceVariantElement { Code = "1RTG", Description = "1RTG Element" });

        var applicant = new Applicant { Service = service, ServiceVariant = serviceVariant };
        var app = new Domain.Entities.Application { Id = Guid.NewGuid(), Status = ApplicationStatus.Evaluating };
        app.ApplicationApplicants.Add(new ApplicationApplicant { Applicant = applicant });

        var command = new CreateSoaCommand(
            ApplicationId: app.Id,
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "John Doe",
            IssuedToAddress: "123 Main St",
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: null,
            ValidityYears: 2
        );

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        StatementOfAccount? savedSoa = null;
        _repositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => savedSoa = s)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedSoa.Should().NotBeNull();
        // 1RTG 2 years: (180 * 2) = 360 + DST (30) = 390
        savedSoa!.TotalAmount.Should().Be(390.00m);
        savedSoa.LineItems.Should().HaveCount(2);
        savedSoa.LineItems.Any(li => li.ItemCode == "ROC" && li.Amount == 360.00m).Should().BeTrue();
        savedSoa.LineItems.Any(li => li.ItemCode == "DST" && li.Amount == 30.00m).Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ShouldComputeSoa_UsingConfiguredDynamicFormula_WhenVariantFeesAndFormulaExist()
    {
        // Arrange
        var variantId = Guid.NewGuid();
        var serviceCategory = new ServiceCategory { Name = "Licenses", Code = "LIC", Type = ServiceCategoryType.License };
        var service = new Service { Name = "COMMERCIAL RADIO STATION LICENSES", ServiceCategory = serviceCategory };
        var serviceVariant = new ServiceVariant { Id = variantId, Description = "Base Station License", Type = ServiceVariantType.New };
        var statutoryFee = new Fee { Name = "Filing Fee", Code = "FF", Description = "Filing Fee" };
        var variantFee = new ServiceVariantFee { Id = Guid.NewGuid(), ServiceVariantId = variantId, FeeId = statutoryFee.Id, Fee = statutoryFee, Amount = 180.00m, IsActive = true };

        var applicant = new Applicant { Service = service, ServiceVariant = serviceVariant };
        var app = new Domain.Entities.Application { Id = Guid.NewGuid(), Status = ApplicationStatus.Evaluating };
        app.ApplicationApplicants.Add(new ApplicationApplicant { Applicant = applicant });

        var command = new CreateSoaCommand(
            ApplicationId: app.Id,
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "Test Licensee",
            IssuedToAddress: "456 Station Road",
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: null,
            ValidityYears: 3,
            NoOfUnits: 2
        );

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _variantFeeRepositoryMock
            .Setup(r => r.GetByServiceVariantIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantFee> { variantFee });

        _formulaRepositoryMock
            .Setup(r => r.GetByServiceVariantIdAsync(variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ServiceVariantFormula { ServiceVariantId = variantId, FormulaExpression = "TOTAL = {RATE} * {YEARS} * {UNITS}" });

        StatementOfAccount? savedSoa = null;
        _repositoryMock
            .Setup(r => r.AddSoaAsync(It.IsAny<StatementOfAccount>(), It.IsAny<CancellationToken>()))
            .Callback<StatementOfAccount, CancellationToken>((s, _) => savedSoa = s)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        savedSoa.Should().NotBeNull();
        // 180 * 3 years * 2 units = 1080
        savedSoa!.TotalAmount.Should().Be(1080.00m);
        savedSoa.LineItems.Should().HaveCount(1);
        savedSoa.LineItems.First().Amount.Should().Be(1080.00m);
        savedSoa.LineItems.First().ValidityYears.Should().Be(3);
        savedSoa.LineItems.First().NoOfUnits.Should().Be(2);
    }

    [Fact]
    public async Task Handle_ShouldRecordApplicationHistory_WhenSoaIsGenerated()
    {
        // Arrange
        var app = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Evaluating,
            ReferenceNumber = "APP-TEST-001"
        };
        var lineItem = new CreateSoaLineItemRequest("Processing Fee", "FEE-01", "Desc", null, null, 1, 1, 500m, 500m);
        var command = new CreateSoaCommand(
            app.Id,
            null,
            "Individual",
            "Jane Applicant",
            "123 Street",
            DateTime.UtcNow.AddDays(30),
            new List<CreateSoaLineItemRequest> { lineItem });

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        ApplicationHistory? recordedHistory = null;
        _repositoryMock
            .Setup(r => r.AddApplicationHistoryAsync(It.IsAny<ApplicationHistory>(), It.IsAny<CancellationToken>()))
            .Callback<ApplicationHistory, CancellationToken>((h, _) => recordedHistory = h)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        recordedHistory.Should().NotBeNull();
        recordedHistory!.ApplicationId.Should().Be(app.Id);
        recordedHistory.Action.Should().Be("Statement of Account (SOA) Generated");
        recordedHistory.FromStatus.Should().Be(ApplicationStatus.Evaluating);
        recordedHistory.ToStatus.Should().Be(ApplicationStatus.Evaluating);
        recordedHistory.StaffRole.Should().Be("Evaluator");
        recordedHistory.Remarks.Should().Contain("Statement of Account (SOA-");
        recordedHistory.Remarks.Should().Contain("500.00");
        app.Histories.Should().Contain(recordedHistory);
    }
}
