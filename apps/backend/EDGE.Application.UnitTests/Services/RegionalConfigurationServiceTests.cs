using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Services;

public class RegionalConfigurationServiceTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<ISystemConfigRepository> _systemConfigRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly RegionalConfigurationService _service;
    private readonly Dictionary<string, SystemConfig> _configs = new();
    private readonly Guid _testTenantId = Guid.NewGuid();

    public RegionalConfigurationServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"RegConfigTests_{Guid.NewGuid()}")
            .Options;

        _context = new ApplicationDbContext(options);

        _systemConfigRepoMock
            .Setup(r => r.GetByKeyAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string key, CancellationToken _) => _configs.TryGetValue(key, out var val) ? val : null);

        _systemConfigRepoMock
            .Setup(r => r.AddAsync(It.IsAny<SystemConfig>(), It.IsAny<CancellationToken>()))
            .Returns((SystemConfig c, CancellationToken _) =>
            {
                _configs[c.Key] = c;
                return Task.CompletedTask;
            });

        _systemConfigRepoMock
            .Setup(r => r.Update(It.IsAny<SystemConfig>()))
            .Callback<SystemConfig>(c => _configs[c.Key] = c);

        _service = new RegionalConfigurationService(_context, _systemConfigRepoMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task GetConfigurationAsync_ShouldReturnDefaultConfig_WhenNoSettingsExist()
    {
        var config = await _service.GetConfigurationAsync(_testTenantId);

        config.Should().NotBeNull();
        config.RcCodeSoa.Should().NotBeNullOrWhiteSpace();
        config.RcCodeOp.Should().NotBeNullOrWhiteSpace();
        config.FundCluster.Should().Be("01");
        config.RequestAndComplaintRouting.Should().Be("DirectToLegal");
    }

    [Fact]
    public async Task UpdateConfigurationAsync_ShouldSaveRegionalSettings()
    {
        var updateDto = new RegionalConfigurationDto
        {
            TenantId = _testTenantId,
            TenantCode = "10",
            TenantName = "Region X - Northern Mindanao",
            RcCodeSoa = "61",
            RcCodeOp = "61",
            FundCluster = "02",
            RequestAndComplaintRouting = "DirectToEvaluator"
        };

        var result = await _service.UpdateConfigurationAsync(updateDto);

        result.RcCodeSoa.Should().Be("61");
        result.RcCodeOp.Should().Be("61");
        result.FundCluster.Should().Be("02");
        result.RequestAndComplaintRouting.Should().Be("DirectToEvaluator");

        _configs.Should().ContainKey($"TenantConfig:{_testTenantId}:RCCodeSOA");
        _configs[$"TenantConfig:{_testTenantId}:RCCodeSOA"].Value.Should().Be("61");
        _configs[$"TenantConfig:{_testTenantId}:FundCluster"].Value.Should().Be("02");
        _configs[$"TenantConfig:{_testTenantId}:RequestAndComplaintRouting"].Value.Should().Be("DirectToEvaluator");
    }
}
