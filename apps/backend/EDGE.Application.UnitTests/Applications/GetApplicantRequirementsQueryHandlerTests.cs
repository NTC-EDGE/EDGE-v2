using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Queries.GetApplicantRequirements;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Applications;

public class GetApplicantRequirementsQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockAppRepo;
    private readonly Mock<IRequirementRepository> _mockReqRepo;
    private readonly Mock<IServiceRepository> _mockServiceRepo;
    private readonly Mock<IStoredFileRepository> _mockStoredFileRepo;
    private readonly GetApplicantRequirementsQueryHandler _handler;

    public GetApplicantRequirementsQueryHandlerTests()
    {
        _mockAppRepo = new Mock<IApplicationFullRepository>();
        _mockReqRepo = new Mock<IRequirementRepository>();
        _mockServiceRepo = new Mock<IServiceRepository>();
        _mockStoredFileRepo = new Mock<IStoredFileRepository>();

        _handler = new GetApplicantRequirementsQueryHandler(
            _mockAppRepo.Object,
            _mockReqRepo.Object,
            _mockServiceRepo.Object,
            _mockStoredFileRepo.Object);
    }

    [Fact]
    public async Task Handle_ApplicationNotFound_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var query = new GetApplicantRequirementsQuery(appId, applicantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
    }

    [Fact]
    public async Task Handle_ApplicantNotLinked_ReturnsFailure()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant>()
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var query = new GetApplicantRequirementsQuery(appId, applicantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not linked");
    }

    [Fact]
    public async Task Handle_ValidRequest_ReturnsRequirementsList()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var applicantId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var reqId = Guid.NewGuid();
        var svrId = Guid.NewGuid();

        var applicant = new Applicant
        {
            Id = applicantId,
            ServiceId = serviceId,
            ServiceVariantId = variantId
        };

        var appApplicant = new ApplicationApplicant
        {
            ApplicationId = appId,
            ApplicantId = applicantId,
            Applicant = applicant
        };

        var app = new Domain.Entities.Application
        {
            Id = appId,
            ApplicationApplicants = new List<ApplicationApplicant> { appApplicant },
            ApplicationRequirements = new List<ApplicationRequirement>()
        };

        var requirement = new Requirement
        {
            Id = reqId,
            Name = "Proof of Identity",
            Description = "Government ID Copy"
        };

        var rule = new ServiceVariantRequirement
        {
            Id = svrId,
            RequirementId = reqId,
            Requirement = requirement,
            IsRequired = true
        };

        _mockAppRepo.Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _mockReqRepo.Setup(r => r.GetServiceVariantRequirementsAsync(serviceId, variantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantRequirement> { rule });

        var query = new GetApplicantRequirementsQuery(appId, applicantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.Should().HaveCount(1);
        result.Data![0].RequirementName.Should().Be("Proof of Identity");
        result.Data[0].IsRequired.Should().BeTrue();
        result.Data[0].SubmittedRequirementId.Should().BeNull();
    }
}
