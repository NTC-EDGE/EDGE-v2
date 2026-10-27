using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Requirements.Queries.GetRequirements;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Requirements;

public class GetRequirementsQueryHandlerTests
{
    private readonly Mock<IRequirementRepository> _mockRepo;
    private readonly GetRequirementsQueryHandler _handler;

    public GetRequirementsQueryHandlerTests()
    {
        _mockRepo = new Mock<IRequirementRepository>();
        _handler = new GetRequirementsQueryHandler(_mockRepo.Object);
    }

    [Fact]
    public async Task Handle_WhenNoSearchTerm_ReturnsAllPaginatedRequirements()
    {
        // Arrange
        var sampleData = new List<Requirement>
        {
            new() { Id = Guid.NewGuid(), Name = "Requirement A", Description = "Desc A" },
            new() { Id = Guid.NewGuid(), Name = "Requirement B", Description = "Desc B" },
            new() { Id = Guid.NewGuid(), Name = "Requirement C", Description = "Desc C" }
        };
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleData);

        var query = new GetRequirementsQuery(PageNumber: 1, PageSize: 2, SearchTerm: null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(3);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(2);
        result.TotalPages.Should().Be(2);
        result.Data.Should().HaveCount(2);
        result.Data[0].Name.Should().Be("Requirement A");
        result.Data[1].Name.Should().Be("Requirement B");
    }

    [Fact]
    public async Task Handle_WithSearchTermMatchingName_FiltersCorrectly()
    {
        // Arrange
        var sampleData = new List<Requirement>
        {
            new() { Id = Guid.NewGuid(), Name = "Mayor's Permit", Description = "Business permit" },
            new() { Id = Guid.NewGuid(), Name = "DTI Registration", Description = "DTI certificate" },
            new() { Id = Guid.NewGuid(), Name = "SEC Permit", Description = "Securities permit" }
        };
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleData);

        var query = new GetRequirementsQuery(PageNumber: 1, PageSize: 10, SearchTerm: "permit");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(2);
        result.Data.Should().HaveCount(2);
        result.Data.Should().Contain(r => r.Name == "Mayor's Permit");
        result.Data.Should().Contain(r => r.Name == "SEC Permit");
    }

    [Fact]
    public async Task Handle_WithSearchTermMatchingDescription_FiltersCorrectly()
    {
        // Arrange
        var sampleData = new List<Requirement>
        {
            new() { Id = Guid.NewGuid(), Name = "Document 1", Description = "Radio station license" },
            new() { Id = Guid.NewGuid(), Name = "Document 2", Description = "Passport copy" }
        };
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleData);

        var query = new GetRequirementsQuery(PageNumber: 1, PageSize: 10, SearchTerm: "radio station");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(1);
        result.Data.Should().HaveCount(1);
        result.Data[0].Name.Should().Be("Document 1");
    }

    [Fact]
    public async Task Handle_SecondPage_PaginatesProperly()
    {
        // Arrange
        var sampleData = new List<Requirement>
        {
            new() { Id = Guid.NewGuid(), Name = "Req 1", Description = "D1" },
            new() { Id = Guid.NewGuid(), Name = "Req 2", Description = "D2" },
            new() { Id = Guid.NewGuid(), Name = "Req 3", Description = "D3" }
        };
        _mockRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleData);

        var query = new GetRequirementsQuery(PageNumber: 2, PageSize: 2, SearchTerm: null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(3);
        result.PageNumber.Should().Be(2);
        result.Data.Should().HaveCount(1);
        result.Data[0].Name.Should().Be("Req 3");
    }
}
