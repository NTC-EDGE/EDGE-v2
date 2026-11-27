using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.Validators;
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

    [Fact]
    public async Task UpdateConfigurationAsync_ShouldPersistAndLoadAllReportSignatories()
    {
        var signatories = new ReportSignatoriesDto
        {
            RegionalDirectorName = "ENGR. JUAN A. DELA CRUZ",
            RegionalDirectorTitle = "Regional Director",
            ChiefEodName = "ENGR. MARIA B. SANTOS",
            ChiefEodTitle = "Chief, Enforcement & Operations Division",
            RegionalAccountantName = "CPA ANA C. GARCIA",
            RegionalAccountantTitle = "Regional Accountant III",
            CollectingOfficerName = "JOSE D. RAMOS",
            CollectingOfficerTitle = "Collecting Officer / Cashier III",
            MisOfficerName = "CARLA E. MENDOZA",
            MisOfficerTitle = "MIS / Planning Officer",
            ExamProctorName = "ENGR. PEDRO F. REYES",
            ExamProctorTitle = "Chair, Regional Examination Committee"
        };

        var updateDto = new RegionalConfigurationDto
        {
            TenantId = _testTenantId,
            TenantCode = "10",
            TenantName = "Region X - Northern Mindanao",
            RcCodeSoa = "61",
            RcCodeOp = "61",
            FundCluster = "01",
            RequestAndComplaintRouting = "DirectToLegal",
            ReportSignatories = signatories
        };

        await _service.UpdateConfigurationAsync(updateDto);
        var loaded = await _service.GetConfigurationAsync(_testTenantId);

        loaded.ReportSignatories.Should().NotBeNull();
        loaded.ReportSignatories!.RegionalDirectorName.Should().Be("ENGR. JUAN A. DELA CRUZ");
        loaded.ReportSignatories.RegionalDirectorTitle.Should().Be("Regional Director");
        loaded.ReportSignatories.ChiefEodName.Should().Be("ENGR. MARIA B. SANTOS");
        loaded.ReportSignatories.ChiefEodTitle.Should().Be("Chief, Enforcement & Operations Division");
        loaded.ReportSignatories.RegionalAccountantName.Should().Be("CPA ANA C. GARCIA");
        loaded.ReportSignatories.RegionalAccountantTitle.Should().Be("Regional Accountant III");
        loaded.ReportSignatories.CollectingOfficerName.Should().Be("JOSE D. RAMOS");
        loaded.ReportSignatories.CollectingOfficerTitle.Should().Be("Collecting Officer / Cashier III");
        loaded.ReportSignatories.MisOfficerName.Should().Be("CARLA E. MENDOZA");
        loaded.ReportSignatories.MisOfficerTitle.Should().Be("MIS / Planning Officer");
        loaded.ReportSignatories.ExamProctorName.Should().Be("ENGR. PEDRO F. REYES");
        loaded.ReportSignatories.ExamProctorTitle.Should().Be("Chair, Regional Examination Committee");
    }

    [Fact]
    public async Task UpdateConfigurationAsync_ShouldPreserveExistingSignatories_WhenSignatoriesPayloadIsNull()
    {
        await _service.UpdateConfigurationAsync(new RegionalConfigurationDto
        {
            TenantId = _testTenantId,
            TenantCode = "10",
            TenantName = "Region X - Northern Mindanao",
            RcCodeSoa = "61",
            RcCodeOp = "61",
            FundCluster = "01",
            ReportSignatories = new ReportSignatoriesDto
            {
                RegionalDirectorName = "ENGR. TEDDY E. BAUTISTA",
                RegionalDirectorTitle = "Regional Director"
            }
        });

        await _service.UpdateConfigurationAsync(new RegionalConfigurationDto
        {
            TenantId = _testTenantId,
            TenantCode = "10",
            TenantName = "Region X - Northern Mindanao",
            RcCodeSoa = "61",
            RcCodeOp = "61",
            FundCluster = "02",
            EnableInternalEmailNotifications = false,
            ReportSignatories = null
        });

        var loaded = await _service.GetConfigurationAsync(_testTenantId);
        loaded.FundCluster.Should().Be("02");
        loaded.EnableInternalEmailNotifications.Should().BeFalse();
        loaded.ReportSignatories.Should().NotBeNull();
        loaded.ReportSignatories!.RegionalDirectorName.Should().Be("ENGR. TEDDY E. BAUTISTA");
    }

    [Fact]
    public async Task RegionalConfigurationDtoValidator_ShouldRejectOverlongSignatoryFields()
    {
        var validator = new RegionalConfigurationDtoValidator();
        var invalidDto = new RegionalConfigurationDto
        {
            RcCodeSoa = "61",
            RcCodeOp = "61",
            FundCluster = "01",
            ReportSignatories = new ReportSignatoriesDto
            {
                RegionalDirectorName = new string('A', 151)
            }
        };

        var result = await validator.ValidateAsync(invalidDto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ReportSignatories.RegionalDirectorName");
    }
}
