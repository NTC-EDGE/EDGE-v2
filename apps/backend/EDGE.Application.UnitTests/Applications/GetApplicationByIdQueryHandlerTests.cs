using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Queries.GetApplicationById;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class GetApplicationByIdQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock;
    private readonly GetApplicationByIdQueryHandler _handler;

    public GetApplicationByIdQueryHandlerTests()
    {
        _repositoryMock = new Mock<IApplicationFullRepository>();
        _handler = new GetApplicationByIdQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_WhenEvaluatorForwardsToAccountant_AccountingOfficerMustBeNullAndEvaluatorPreserved()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var evaluatorName = "Engr. Maria Santos";

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = Guid.NewGuid(),
            ApplicationNumber = "APP-2026-0001",
            ReferenceNumber = "REF-2026-0001",
            Status = ApplicationStatus.ForAccountant,
            Intent = ApplicationIntent.Regular,
            CreatedAt = DateTime.UtcNow.AddHours(-2),
            Histories = new List<ApplicationHistory>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appId,
                    Action = "Evaluation Started",
                    StaffName = evaluatorName,
                    StaffRole = "Evaluating Officer",
                    FromStatus = ApplicationStatus.Submitted,
                    ToStatus = ApplicationStatus.Evaluating,
                    Timestamp = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appId,
                    Action = "Approved & Forwarded to Accountant",
                    StaffName = evaluatorName,
                    StaffRole = "Evaluating Officer",
                    Remarks = "Approved and forwarded to Accountant for review.",
                    FromStatus = ApplicationStatus.Evaluating,
                    ToStatus = ApplicationStatus.ForAccountant,
                    Timestamp = DateTime.UtcNow.AddHours(-1)
                }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(appId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _repositoryMock.Setup(r => r.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalSignatoriesDto());

        var query = new GetApplicationByIdQuery(appId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.EvaluatingOfficer.Should().Be(evaluatorName);
        result.Data.AccountingOfficer.Should().BeNull("Evaluator's handoff action must not assign the Evaluator as AccountingOfficer");
    }

    [Fact]
    public async Task Handle_WhenAccountantTakesApplication_AccountingOfficerResolvesToAccountant()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var evaluatorName = "Engr. Maria Santos";
        var accountantName = "Ann Accountant";

        var app = new Domain.Entities.Application
        {
            Id = appId,
            TenantId = Guid.NewGuid(),
            ApplicationNumber = "APP-2026-0002",
            ReferenceNumber = "REF-2026-0002",
            Status = ApplicationStatus.ForAccountant,
            Intent = ApplicationIntent.Regular,
            CreatedAt = DateTime.UtcNow.AddHours(-3),
            Histories = new List<ApplicationHistory>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appId,
                    Action = "Evaluation Started",
                    StaffName = evaluatorName,
                    StaffRole = "Evaluating Officer",
                    FromStatus = ApplicationStatus.Submitted,
                    ToStatus = ApplicationStatus.Evaluating,
                    Timestamp = DateTime.UtcNow.AddHours(-3)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appId,
                    Action = "Approved & Forwarded to Accountant",
                    StaffName = evaluatorName,
                    StaffRole = "Evaluating Officer",
                    Remarks = "Approved and forwarded to Accountant for review.",
                    FromStatus = ApplicationStatus.Evaluating,
                    ToStatus = ApplicationStatus.ForAccountant,
                    Timestamp = DateTime.UtcNow.AddHours(-2)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    ApplicationId = appId,
                    Action = "Financial Review Started",
                    StaffName = accountantName,
                    StaffRole = "Accountant",
                    Remarks = "Financial review started by Ann Accountant. Authority claimed.",
                    FromStatus = ApplicationStatus.ForAccountant,
                    ToStatus = ApplicationStatus.ForAccountant,
                    Timestamp = DateTime.UtcNow.AddHours(-1)
                }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(appId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);
        _repositoryMock.Setup(r => r.GetRegionalSignatoriesAsync(app.TenantId, app.RegionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegionalSignatoriesDto());

        var query = new GetApplicationByIdQuery(appId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.EvaluatingOfficer.Should().Be(evaluatorName);
        result.Data.AccountingOfficer.Should().Be(accountantName, "Explicit claim by Accountant must resolve as AccountingOfficer");
    }
}
