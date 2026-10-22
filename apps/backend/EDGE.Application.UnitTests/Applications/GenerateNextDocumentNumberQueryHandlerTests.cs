using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Queries.GenerateNextDocumentNumber;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class GenerateNextDocumentNumberQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly GenerateNextDocumentNumberQueryHandler _handler;

    public GenerateNextDocumentNumberQueryHandlerTests()
    {
        _handler = new GenerateNextDocumentNumberQueryHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        // Arrange
        var query = new GenerateNextDocumentNumberQuery { ApplicationId = Guid.NewGuid() };
        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(query.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Be("Application not found.");
    }

    [Fact]
    public async Task Handle_ShouldGenerateDocumentNumbers_WithRegionAndServiceInfo()
    {
        // Arrange
        var appId = Guid.NewGuid();
        var app = new Domain.Entities.Application
        {
            Id = appId,
            Region = new Region { Code = "R07", Name = "Region VII" },
            OrdersOfPayment = new List<OrderOfPayment>
            {
                new OrderOfPayment
                {
                    Status = OpStatus.Paid,
                    OfficialReceiptNumber = "OR-100200"
                }
            },
            Histories = new List<ApplicationHistory>
            {
                new ApplicationHistory
                {
                    Action = "Technical Evaluation Approved",
                    StaffName = "Engr. Evaluator 1",
                    Timestamp = DateTime.UtcNow.AddDays(-1)
                }
            }
        };

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        _repositoryMock
            .Setup(r => r.GetIssuedDocumentByApplicationIdAsync(appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((IssuedDocumentDetail?)null);

        var query = new GenerateNextDocumentNumberQuery { ApplicationId = appId };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.RecommendedFormNumber.Should().StartWith($"NTC-R07-{DateTime.UtcNow.Year}-FORM-");
        result.Data.OfficePrefix.Should().Be("R07");
        result.Data.OfficialReceiptNumber.Should().Be("OR-100200");
        result.Data.OriginalEvaluatorName.Should().Be("Engr. Evaluator 1");
        result.Data.IsPaid.Should().BeTrue();
    }
}
