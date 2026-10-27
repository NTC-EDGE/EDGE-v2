using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Services.Queries.GetServiceVariants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Services;

public class GetServiceVariantsQueryHandlerTests
{
    private readonly Mock<IServiceRepository> _mockServiceRepo;
    private readonly Mock<IServiceVariantRepository> _mockVariantRepo;
    private readonly GetServiceVariantsQueryHandler _handler;

    public GetServiceVariantsQueryHandlerTests()
    {
        _mockServiceRepo = new Mock<IServiceRepository>();
        _mockVariantRepo = new Mock<IServiceVariantRepository>();
        _handler = new GetServiceVariantsQueryHandler(_mockServiceRepo.Object, _mockVariantRepo.Object);
    }

    [Fact]
    public async Task Handle_WhenFilteredByCategoryId_ReturnsOnlyVariantsOfThatCategory()
    {
        // Arrange
        var cat1 = Guid.NewGuid();
        var cat2 = Guid.NewGuid();

        var svc1 = new Service { Id = Guid.NewGuid(), Name = "Service Permits", ServiceCategoryId = cat1 };
        var svc2 = new Service { Id = Guid.NewGuid(), Name = "Service Exams", ServiceCategoryId = cat2 };

        var sampleVariants = new List<ServiceVariant>
        {
            new() { Id = Guid.NewGuid(), ServiceId = svc1.Id, Service = svc1, Type = ServiceVariantType.New, Description = "Permit New" },
            new() { Id = Guid.NewGuid(), ServiceId = svc1.Id, Service = svc1, Type = ServiceVariantType.Renewal, Description = "Permit Renewal" },
            new() { Id = Guid.NewGuid(), ServiceId = svc2.Id, Service = svc2, Type = ServiceVariantType.FirstTaker, Description = "Exam First Taker" }
        };

        _mockVariantRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleVariants);

        var query = new GetServiceVariantsQuery(
            ServiceId: null,
            PageNumber: 1,
            PageSize: 10,
            SearchTerm: null,
            CategoryId: cat1
        );

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(2);
        result.Data.Should().HaveCount(2);
        result.Data.Should().AllSatisfy(v => v.ServiceName.Should().Be("Service Permits"));
    }

    [Fact]
    public async Task Handle_WhenSearchMatchesTypeOrServiceNameOrDescription_FiltersCorrectly()
    {
        // Arrange
        var svc = new Service { Id = Guid.NewGuid(), Name = "Radio Operator License", ServiceCategoryId = Guid.NewGuid() };

        var sampleVariants = new List<ServiceVariant>
        {
            new() { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.New, Description = "Brand New License" },
            new() { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.Renewal, Description = "Annual Renewal" }
        };

        _mockVariantRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleVariants);

        var query = new GetServiceVariantsQuery(
            ServiceId: null,
            PageNumber: 1,
            PageSize: 10,
            SearchTerm: "renewal",
            CategoryId: null
        );

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(1);
        result.Data[0].Type.Should().Be("Renewal");
    }

    [Fact]
    public async Task Handle_PaginatesAndOrdersDeterministically()
    {
        // Arrange
        var svcA = new Service { Id = Guid.NewGuid(), Name = "Alpha Service", ServiceCategoryId = Guid.NewGuid() };
        var svcB = new Service { Id = Guid.NewGuid(), Name = "Beta Service", ServiceCategoryId = Guid.NewGuid() };

        var sampleVariants = new List<ServiceVariant>
        {
            new() { Id = Guid.NewGuid(), ServiceId = svcB.Id, Service = svcB, Type = ServiceVariantType.New, Description = "Beta New" },
            new() { Id = Guid.NewGuid(), ServiceId = svcA.Id, Service = svcA, Type = ServiceVariantType.Renewal, Description = "Alpha Renewal" },
            new() { Id = Guid.NewGuid(), ServiceId = svcA.Id, Service = svcA, Type = ServiceVariantType.New, Description = "Alpha New" }
        };

        _mockVariantRepo.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleVariants);

        var query = new GetServiceVariantsQuery(
            ServiceId: null,
            PageNumber: 1,
            PageSize: 2,
            SearchTerm: null,
            CategoryId: null
        );

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.TotalCount.Should().Be(3);
        result.Data.Should().HaveCount(2);
        result.Data[0].ServiceName.Should().Be("Alpha Service");
        result.Data[1].ServiceName.Should().Be("Alpha Service");
    }
}
