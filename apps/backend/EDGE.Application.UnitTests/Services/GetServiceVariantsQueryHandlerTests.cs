using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Services.Queries.GetServiceVariants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Repositories;

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
    public async Task Handle_WhenCalled_DelegatesToRepositoryAndMapsDtos()
    {
        // Arrange
        var svc = new Service { Id = Guid.NewGuid(), Name = "Sample Service" };
        var sampleVariants = new List<ServiceVariant>
        {
            new() { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.New, Description = "New Var", IsIndividual = true },
            new() { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.Renewal, Description = "Ren Var", IsIndividual = false }
        };

        _mockVariantRepo.Setup(r => r.GetPagedAsync(null, null, "test", 1, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync((sampleVariants, 5));

        var query = new GetServiceVariantsQuery(
            ServiceId: null,
            PageNumber: 1,
            PageSize: 2,
            SearchTerm: "test",
            CategoryId: null
        );

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TotalCount.Should().Be(5);
        result.Data.Should().HaveCount(2);
        result.Data[0].ServiceName.Should().Be("Sample Service");
        result.Data[0].Type.Should().Be("New");
        result.Data[0].IsIndividual.Should().BeTrue();
        result.Data[1].IsIndividual.Should().BeFalse();
    }

    [Fact]
    public async Task ServiceVariantRepository_GetPagedAsync_FiltersByCategoryIdAtDatabaseLevel()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"VarCatTests_{Guid.NewGuid()}")
            .Options;

        using var context = new ApplicationDbContext(options);
        var repo = new ServiceVariantRepository(context);

        var cat1 = Guid.NewGuid();
        var cat2 = Guid.NewGuid();

        var svc1 = new Service { Id = Guid.NewGuid(), Name = "Service Permits", ServiceCategoryId = cat1, Description = "Permits" };
        var svc2 = new Service { Id = Guid.NewGuid(), Name = "Service Exams", ServiceCategoryId = cat2, Description = "Exams" };

        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svc1.Id, Service = svc1, Type = ServiceVariantType.New, Description = "Permit New" });
        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svc1.Id, Service = svc1, Type = ServiceVariantType.Renewal, Description = "Permit Renewal" });
        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svc2.Id, Service = svc2, Type = ServiceVariantType.FirstTaker, Description = "Exam First Taker" });
        await context.SaveChangesAsync();

        // Act
        var (items, totalCount) = await repo.GetPagedAsync(categoryId: cat1, pageNumber: 1, pageSize: 10);

        // Assert
        totalCount.Should().Be(2);
        items.Should().HaveCount(2);
        items.Should().AllSatisfy(v => v.ServiceId.Should().Be(svc1.Id));
    }

    [Fact]
    public async Task ServiceVariantRepository_GetPagedAsync_FiltersBySearchTermAtDatabaseLevel()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"VarSearchTests_{Guid.NewGuid()}")
            .Options;

        using var context = new ApplicationDbContext(options);
        var repo = new ServiceVariantRepository(context);

        var svc = new Service { Id = Guid.NewGuid(), Name = "Radio Operator License", ServiceCategoryId = Guid.NewGuid(), Description = "Radio" };

        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.New, Description = "Brand New License", IsIndividual = true });
        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svc.Id, Service = svc, Type = ServiceVariantType.Renewal, Description = "Annual Renewal", IsIndividual = false });
        await context.SaveChangesAsync();

        // Act - Search by "renewal"
        var (itemsRenewal, totalRenewal) = await repo.GetPagedAsync(searchTerm: "renewal", pageNumber: 1, pageSize: 10);
        // Act - Search by "radio operator"
        var (itemsSvc, totalSvc) = await repo.GetPagedAsync(searchTerm: "radio operator", pageNumber: 1, pageSize: 10);
        // Act - Search by "individual"
        var (itemsIndiv, totalIndiv) = await repo.GetPagedAsync(searchTerm: "individual", pageNumber: 1, pageSize: 10);

        // Assert
        totalRenewal.Should().Be(1);
        itemsRenewal[0].Type.Should().Be(ServiceVariantType.Renewal);

        totalSvc.Should().Be(2);

        totalIndiv.Should().Be(1);
        itemsIndiv[0].IsIndividual.Should().BeTrue();
    }

    [Fact]
    public async Task ServiceVariantRepository_GetPagedAsync_PaginatesAndOrdersDeterministically()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"VarPagTests_{Guid.NewGuid()}")
            .Options;

        using var context = new ApplicationDbContext(options);
        var repo = new ServiceVariantRepository(context);

        var svcA = new Service { Id = Guid.NewGuid(), Name = "Alpha Service", ServiceCategoryId = Guid.NewGuid(), Description = "Alpha" };
        var svcB = new Service { Id = Guid.NewGuid(), Name = "Beta Service", ServiceCategoryId = Guid.NewGuid(), Description = "Beta" };

        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svcB.Id, Service = svcB, Type = ServiceVariantType.New, Description = "Beta New" });
        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svcA.Id, Service = svcA, Type = ServiceVariantType.Renewal, Description = "Alpha Renewal" });
        await repo.AddAsync(new ServiceVariant { Id = Guid.NewGuid(), ServiceId = svcA.Id, Service = svcA, Type = ServiceVariantType.New, Description = "Alpha New" });
        await context.SaveChangesAsync();

        // Act
        var (itemsPage1, totalCount) = await repo.GetPagedAsync(pageNumber: 1, pageSize: 2);
        var (itemsPage2, _) = await repo.GetPagedAsync(pageNumber: 2, pageSize: 2);

        // Assert
        totalCount.Should().Be(3);
        itemsPage1.Should().HaveCount(2);
        itemsPage1[0].Service!.Name.Should().Be("Alpha Service");
        itemsPage1[1].Service!.Name.Should().Be("Alpha Service");

        itemsPage2.Should().HaveCount(1);
        itemsPage2[0].Service!.Name.Should().Be("Beta Service");
    }
}
