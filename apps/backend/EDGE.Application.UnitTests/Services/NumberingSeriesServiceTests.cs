using System;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Services;

public class NumberingSeriesServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IRegionalConfigurationService> _configServiceMock = new();
    private readonly NumberingSeriesService _service;
    private readonly Guid _testTenantId = Guid.NewGuid();

    public NumberingSeriesServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"NumberingTests_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);

        _configServiceMock
            .Setup(c => c.GetConfigurationAsync(It.IsAny<Guid>(), default))
            .ReturnsAsync(new RegionalConfigurationDto
            {
                TenantId = _testTenantId,
                TenantCode = "10",
                TenantName = "Region X - Northern Mindanao",
                RcCodeSoa = "61",
                RcCodeOp = "61",
                FundCluster = "01",
                RequestAndComplaintRouting = "DirectToLegal"
            });

        _service = new NumberingSeriesService(_context, _configServiceMock.Object);
    }

    [Fact]
    public async Task GenerateSoaNumberAsync_ShouldGenerateFormattedNumber_WhenNoExistingSoa()
    {
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");
        var expectedPrefix = $"61-{year}-{month}-0001";

        var result = await _service.GenerateSoaNumberAsync(_testTenantId);

        result.Should().Be(expectedPrefix);
    }

    [Fact]
    public async Task GenerateSoaNumberAsync_ShouldIncrementSeries_WhenExistingSoaExists()
    {
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");

        _context.StatementsOfAccount.Add(new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            SoaNumber = $"61-{year}-{month}-0001",
            Status = SoaStatus.Pending
        });
        _context.StatementsOfAccount.Add(new StatementOfAccount
        {
            Id = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            SoaNumber = $"61-{year}-{month}-0002",
            Status = SoaStatus.Pending
        });
        await _context.SaveChangesAsync();

        var result = await _service.GenerateSoaNumberAsync(_testTenantId);

        result.Should().Be($"61-{year}-{month}-0003");
    }

    [Fact]
    public async Task GenerateOpNumberAsync_ShouldGenerateFormattedNumber_WhenNoExistingOp()
    {
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");
        var expectedPrefix = $"61-{year}-{month}-0001";

        var result = await _service.GenerateOpNumberAsync(_testTenantId);

        result.Should().Be(expectedPrefix);
    }

    [Fact]
    public async Task GenerateOpNumberAsync_ShouldIncrementSeries_WhenExistingOpExists()
    {
        var year = DateTime.UtcNow.ToString("yyyy");
        var month = DateTime.UtcNow.ToString("MM");

        _context.OrdersOfPayment.Add(new OrderOfPayment
        {
            Id = Guid.NewGuid(),
            ApplicationId = Guid.NewGuid(),
            StatementOfAccountId = Guid.NewGuid(),
            OpNumber = $"61-{year}-{month}-0005",
            Status = OpStatus.Billed
        });
        await _context.SaveChangesAsync();

        var result = await _service.GenerateOpNumberAsync(_testTenantId);

        result.Should().Be($"61-{year}-{month}-0006");
    }
}
