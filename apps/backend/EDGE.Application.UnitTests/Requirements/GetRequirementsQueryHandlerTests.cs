using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Requirements.Queries.GetRequirements;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Repositories;

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
    public async Task Handle_WhenCalled_DelegatesToRepositoryAndMapsDtos()
    {
        // Arrange
        var sampleData = new List<Requirement>
        {
            new() { Id = Guid.NewGuid(), Name = "Requirement A", Description = "Desc A" },
            new() { Id = Guid.NewGuid(), Name = "Requirement B", Description = "Desc B" }
        };
        _mockRepo.Setup(r => r.GetPagedAsync("test", 1, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync((sampleData, 5));

        var query = new GetRequirementsQuery(PageNumber: 1, PageSize: 2, SearchTerm: "test");

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(5);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(2);
        result.TotalPages.Should().Be(3);
        result.Data.Should().HaveCount(2);
        result.Data[0].Name.Should().Be("Requirement A");
        result.Data[1].Name.Should().Be("Requirement B");
    }

    [Fact]
    public async Task RequirementRepository_GetPagedAsync_FiltersAndPaginatesAtDatabaseLevel()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"ReqRepoTests_{Guid.NewGuid()}")
            .Options;

        using var context = new ApplicationDbContext(options);
        var repo = new RequirementRepository(context);

        await repo.AddAsync(new Requirement { Id = Guid.NewGuid(), Name = "Mayor's Permit", Description = "Business permit" });
        await repo.AddAsync(new Requirement { Id = Guid.NewGuid(), Name = "DTI Registration", Description = "DTI certificate" });
        await repo.AddAsync(new Requirement { Id = Guid.NewGuid(), Name = "SEC Permit", Description = "Securities permit" });
        await context.SaveChangesAsync();

        // Act - Search "permit", page 1, size 1
        var (page1Items, totalCount) = await repo.GetPagedAsync(searchTerm: "permit", pageNumber: 1, pageSize: 1);
        var (page2Items, _) = await repo.GetPagedAsync(searchTerm: "permit", pageNumber: 2, pageSize: 1);

        // Assert
        totalCount.Should().Be(2);
        page1Items.Should().HaveCount(1);
        page1Items[0].Name.Should().Be("Mayor's Permit");

        page2Items.Should().HaveCount(1);
        page2Items[0].Name.Should().Be("SEC Permit");
    }

    [Fact]
    public async Task RequirementRepository_GetPagedAsync_WithDescriptionMatch_ReturnsCorrectItem()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"ReqRepoDescTests_{Guid.NewGuid()}")
            .Options;

        using var context = new ApplicationDbContext(options);
        var repo = new RequirementRepository(context);

        await repo.AddAsync(new Requirement { Id = Guid.NewGuid(), Name = "Doc 1", Description = "Radio station license" });
        await repo.AddAsync(new Requirement { Id = Guid.NewGuid(), Name = "Doc 2", Description = "Passport copy" });
        await context.SaveChangesAsync();

        // Act
        var (items, totalCount) = await repo.GetPagedAsync(searchTerm: "radio station", pageNumber: 1, pageSize: 10);

        // Assert
        totalCount.Should().Be(1);
        items.Should().HaveCount(1);
        items[0].Name.Should().Be("Doc 1");
    }
}
