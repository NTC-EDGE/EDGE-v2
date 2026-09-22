using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Reports.Queries.GetOperationalReportStatistics;
using EDGE.Application.Tenants.DTOs;
using EDGE.Domain.Authorization;
using FeedbackEntity = EDGE.Domain.Entities.Feedback;

namespace EDGE.Application.UnitTests.Reports;

public class GetOperationalReportStatisticsQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _applicationRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<IFeedbackRepository> _feedbackRepositoryMock = new();
    private readonly Mock<ITenantContextService> _tenantContextServiceMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    private readonly GetOperationalReportStatisticsQueryHandler _handler;
    private readonly GetOperationalReportStatisticsQueryValidator _validator = new();

    public GetOperationalReportStatisticsQueryHandlerTests()
    {
        _currentUserServiceMock.Setup(u => u.UserId).Returns("user-test-123");
        _tenantContextServiceMock.Setup(t => t.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        _handler = new GetOperationalReportStatisticsQueryHandler(
            _applicationRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _feedbackRepositoryMock.Object,
            _tenantContextServiceMock.Object,
            _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnForbidden_WhenUserIsNotActiveMemberOfTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _tenantContextServiceMock
            .Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var query = new GetOperationalReportStatisticsQuery(TenantId: tenantId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("403 Forbidden");
    }

    [Fact]
    public async Task Handle_ShouldReturnAggregatedStatistics_WhenUserIsAuthorized()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var now = new DateTime(2026, 3, 15, 10, 0, 0, DateTimeKind.Utc);

        _tenantContextServiceMock
            .Setup(t => t.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var sampleApps = new List<ApplicationSummaryDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ApplicationNumber = "APP-001",
                Status = "Approved",
                ServiceName = "Radio Station Permit",
                ServiceCategory = "Permits",
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ApplicationNumber = "APP-002",
                Status = "Evaluating",
                ServiceName = "Operator License",
                ServiceCategory = "Licenses",
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ApplicationNumber = "APP-003",
                Status = "Returned",
                ServiceName = "Radio Station Permit",
                ServiceCategory = "Permits",
                CreatedAt = now
            }
        };

        _applicationRepositoryMock
            .Setup(a => a.GetPagedApplicationSummaryDtosAsync(
                null, null, null, null, null, 1, 1000, null, null, tenantId, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PagedApplicationListDto
            {
                Items = sampleApps,
                TotalCount = sampleApps.Count,
                PageNumber = 1,
                PageSize = 1000
            });

        var sampleTx = new List<TenantTransactionDto>
        {
            new(
                Id: Guid.NewGuid(),
                RefNo: "OR-2026-001",
                ApplicantName: "Alpha Corp",
                ServiceType: "Permit Fee",
                Amount: 5000m,
                PaymentStatus: "Paid",
                Date: now
            ),
            new(
                Id: Guid.NewGuid(),
                RefNo: "OR-2026-002",
                ApplicantName: "Beta Corp",
                ServiceType: "License Fee",
                Amount: 3000m,
                PaymentStatus: "Pending",
                Date: now
            )
        };

        _tenantRepositoryMock
            .Setup(t => t.GetTenantTransactionsAsync(tenantId, null, 1, 1000, It.IsAny<CancellationToken>()))
            .ReturnsAsync((sampleTx, sampleTx.Count));

        var sampleFeedback = new List<FeedbackEntity>
        {
            new()
            {
                Id = Guid.NewGuid(),
                SenderName = "Client A",
                SenderEmail = "clienta@test.com",
                Subject = "Great service",
                Message = "Fast permit issuance",
                Rating = 5,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                SenderName = "Client B",
                SenderEmail = "clientb@test.com",
                Subject = "Average review time",
                Message = "Took 3 days",
                Rating = 4,
                CreatedAt = now
            }
        };

        _feedbackRepositoryMock
            .Setup(f => f.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(sampleFeedback);

        var query = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: "monthly",
            Year: 2026,
            Month: 3
        );

        // Act
        var response = await _handler.Handle(query, CancellationToken.None);

        // Assert
        response.Succeeded.Should().BeTrue();
        response.Data.Should().NotBeNull();

        var data = response.Data!;
        data.Summary.TotalApps.Should().Be(3);
        data.Summary.ApprovedCount.Should().Be(1);
        data.Summary.EvaluatingCount.Should().Be(1);
        data.Summary.ReturnedCount.Should().Be(1);
        data.Summary.ApprovalRate.Should().Be(33); // 1 / 3 = 33.3% -> 33%
        data.Summary.TotalCollected.Should().Be(5000m);
        data.Summary.TotalInvoiced.Should().Be(8000m);
        data.Summary.CsatTotal.Should().Be(2);
        data.Summary.AvgCsat.Should().Be("4.5");

        // Category breakdown
        data.CategoryBreakdown.Should().NotBeEmpty();
        var permitsCat = data.CategoryBreakdown.Find(c => c.Category == "Permits");
        permitsCat.Should().NotBeNull();
        permitsCat!.Count.Should().Be(2);

        // Periodic statistics: 12 monthly buckets
        data.PeriodicStatistics.Should().HaveCount(12);
        var marchBucket = data.PeriodicStatistics[2];
        marchBucket.ShortLabel.Should().Be("Mar");
        marchBucket.TotalApplications.Should().Be(3);
        marchBucket.TotalRevenue.Should().Be(5000m);

        // Statutory report summaries: 6 standard forms
        data.StatutoryReports.Should().HaveCount(6);
        data.StatutoryReports.Should().Contain(r => r.Code == "NTC-BAR-1");
        data.StatutoryReports.Should().Contain(r => r.Code == "NTC-BTr-COA-01");
        data.StatutoryReports.Should().Contain(r => r.Code == "ARTA-RA-11032");
        data.StatutoryReports.Should().Contain(r => r.Code == "NTC-SPECTRUM-INV");
        data.StatutoryReports.Should().Contain(r => r.Code == "NTC-CSMR-8888");
        data.StatutoryReports.Should().Contain(r => r.Code == "NTC-NOV-ENF");
    }

    [Theory]
    [InlineData("monthly", 2026, 1, 1, true)]
    [InlineData("quarterly", 2025, 4, null, true)]
    [InlineData("yearly", 2024, null, null, true)]
    [InlineData("rolling", null, null, null, true)]
    [InlineData("invalid_mode", 2026, 1, 1, false)]
    [InlineData("monthly", 1999, 1, 1, false)]
    [InlineData("quarterly", 2026, 5, null, false)]
    [InlineData("monthly", 2026, null, 13, false)]
    public async Task Validator_ShouldValidatePeriodModeAndRanges(
        string periodMode,
        int? year,
        int? quarter,
        int? month,
        bool shouldBeValid)
    {
        // Arrange
        var query = new GetOperationalReportStatisticsQuery(
            PeriodMode: periodMode,
            Year: year,
            Quarter: quarter,
            Month: month
        );

        // Act
        var result = await _validator.ValidateAsync(query);

        // Assert
        result.IsValid.Should().Be(shouldBeValid);
    }

    [Fact]
    public async Task Handle_WhenApplicationsExceedSinglePage_ShouldBatchFetchAllPages()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _currentUserServiceMock.Setup(s => s.UserId).Returns("user-123");
        _tenantContextServiceMock.Setup(s => s.IsCurrentUserSuperAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _tenantContextServiceMock.Setup(s => s.IsUserActiveMemberAsync(tenantId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var page1Items = Enumerable.Range(1, 1000).Select(i => new ApplicationSummaryDto
        {
            Id = Guid.NewGuid(),
            Status = "Approved",
            CreatedAt = new DateTime(2026, 3, 15, 0, 0, 0, DateTimeKind.Utc)
        }).ToList();

        var page2Items = Enumerable.Range(1001, 500).Select(i => new ApplicationSummaryDto
        {
            Id = Guid.NewGuid(),
            Status = "Approved",
            CreatedAt = new DateTime(2026, 3, 16, 0, 0, 0, DateTimeKind.Utc)
        }).ToList();

        var page1Result = new PagedApplicationListDto
        {
            Items = page1Items,
            PageNumber = 1,
            PageSize = 1000,
            TotalCount = 1500
        };

        var page2Result = new PagedApplicationListDto
        {
            Items = page2Items,
            PageNumber = 2,
            PageSize = 1000,
            TotalCount = 1500
        };

        _applicationRepositoryMock
            .Setup(a => a.GetPagedApplicationSummaryDtosAsync(null, null, null, null, null, 1, 1000, null, null, tenantId, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(page1Result);

        _applicationRepositoryMock
            .Setup(a => a.GetPagedApplicationSummaryDtosAsync(null, null, null, null, null, 2, 1000, null, null, tenantId, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(page2Result);

        _tenantRepositoryMock
            .Setup(t => t.GetTenantTransactionsAsync(tenantId, null, 1, 1000, It.IsAny<CancellationToken>()))
            .ReturnsAsync((new List<TenantTransactionDto>(), 0));

        _feedbackRepositoryMock
            .Setup(f => f.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FeedbackEntity>());

        var query = new GetOperationalReportStatisticsQuery(
            TenantId: tenantId,
            PeriodMode: "monthly",
            Year: 2026,
            Month: 3
        );

        // Act
        var response = await _handler.Handle(query, CancellationToken.None);

        // Assert
        response.Succeeded.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Summary.TotalApps.Should().Be(1500);
        response.Data.Summary.ApprovedCount.Should().Be(1500);
    }
}
