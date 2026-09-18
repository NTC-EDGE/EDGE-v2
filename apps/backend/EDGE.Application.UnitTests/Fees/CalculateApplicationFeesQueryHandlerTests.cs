using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Fees.Calculations;
using EDGE.Application.Fees.Calculations.Strategies;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Fees;

public class CalculateApplicationFeesQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _repositoryMock = new();
    private readonly FeeCalculationEngine _calculationEngine = new(new IFeeCalculationStrategy[]
    {
        new CertificateFeeCalculationStrategy(),
        new LicenseFeeCalculationStrategy(),
        new PermitFeeCalculationStrategy(),
        new ExamFeeCalculationStrategy(),
        new AccreditationFeeCalculationStrategy(),
        new RequestsAndComplaintsFeeCalculationStrategy(),
        new DefaultFeeCalculationStrategy()
    });
    private readonly CalculateApplicationFeesQueryHandler _handler;

    public CalculateApplicationFeesQueryHandlerTests()
    {
        _handler = new CalculateApplicationFeesQueryHandler(_repositoryMock.Object, _calculationEngine);
    }

    [Fact]
    public async Task Handle_ShouldReturnFail_WhenApplicationNotFound()
    {
        var query = new CalculateApplicationFeesQuery(Guid.NewGuid());

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(query.ApplicationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Application?)null);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("was not found");
        result.Data.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ShouldResolvePrimaryApplicantAndComputeCorrectCertificateFees()
    {
        var serviceCategory = new ServiceCategory { Name = "Certificates", Code = "CERT", Type = ServiceCategoryType.Certificate };
        var service = new Service { Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", ServiceCategory = serviceCategory };
        var serviceVariant = new ServiceVariant { Description = "Commercial Radio Operator Certificate (NEW)", Type = ServiceVariantType.New };
        serviceVariant.ServiceVariantElements.Add(new ServiceVariantElement { Code = "1RTG", Description = "1RTG Element" });

        var applicant = new Applicant { Service = service, ServiceVariant = serviceVariant };
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        app.ApplicationApplicants.Add(new ApplicationApplicant { Applicant = applicant });

        var query = new CalculateApplicationFeesQuery(
            ApplicationId: app.Id,
            ValidityYears: 3
        );

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        // 1RTG for 3 years: 180 * 3 = 540 + 30 DST = 570
        result.Data!.SubTotal.Should().Be(540.00m);
        result.Data.TaxAmount.Should().Be(30.00m);
        result.Data.TotalAmount.Should().Be(570.00m);
        result.Data.LineItems.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_ShouldResolveSpecificApplicant_WhenApplicantIdIsProvided()
    {
        var serviceCategory = new ServiceCategory { Name = "Certificates", Code = "CERT", Type = ServiceCategoryType.Certificate };
        var service = new Service { Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", ServiceCategory = serviceCategory };

        var targetVariant = new ServiceVariant { Description = "Commercial Radio Operator Certificate (NEW)", Type = ServiceVariantType.New };
        targetVariant.ServiceVariantElements.Add(new ServiceVariantElement { Code = "2RTG", Description = "2RTG Element" });

        var targetApplicantId = Guid.NewGuid();
        var targetApplicant = new Applicant { Id = targetApplicantId, Service = service, ServiceVariant = targetVariant };

        var otherVariant = new ServiceVariant { Description = "Commercial Radio Operator Certificate (NEW)", Type = ServiceVariantType.New };
        otherVariant.ServiceVariantElements.Add(new ServiceVariantElement { Code = "1RTG", Description = "1RTG Element" });
        var otherApplicant = new Applicant { Id = Guid.NewGuid(), Service = service, ServiceVariant = otherVariant };

        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        app.ApplicationApplicants.Add(new ApplicationApplicant { ApplicantId = otherApplicant.Id, Applicant = otherApplicant });
        app.ApplicationApplicants.Add(new ApplicationApplicant { ApplicantId = targetApplicant.Id, Applicant = targetApplicant });

        var query = new CalculateApplicationFeesQuery(
            ApplicationId: app.Id,
            ApplicantId: targetApplicantId,
            ValidityYears: 1
        );

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        // 2RTG for 1 year: 120 + 30 DST = 150
        result.Data!.SubTotal.Should().Be(120.00m);
        result.Data.TotalAmount.Should().Be(150.00m);
        result.Data.Element.Should().Be("2RTG");
    }

    [Fact]
    public async Task Handle_ShouldFallbackSafely_WhenApplicationHasNoApplicantsOrServiceInfo()
    {
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };

        var query = new CalculateApplicationFeesQuery(app.Id);

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.TotalAmount.Should().BeGreaterThan(0m);
        result.Data.LineItems.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_ShouldCalculateRenewalSurcharges_WhenExpired()
    {
        var serviceCategory = new ServiceCategory { Name = "Certificates", Code = "CERT", Type = ServiceCategoryType.Certificate };
        var service = new Service { Name = "RADIO OPERATOR CERTIFICATES (ROC) EXCLUDING AMATEUR ROC", ServiceCategory = serviceCategory };
        var serviceVariant = new ServiceVariant { Description = "Commercial Radio Operator Certificate (RENEWAL)", Type = ServiceVariantType.Renewal };
        serviceVariant.ServiceVariantElements.Add(new ServiceVariantElement { Code = "1RTG", Description = "1RTG Element" });

        var applicant = new Applicant { Service = service, ServiceVariant = serviceVariant };
        var app = new Domain.Entities.Application { Id = Guid.NewGuid() };
        app.ApplicationApplicants.Add(new ApplicationApplicant { Applicant = applicant });

        var expiration = DateTime.UtcNow.AddDays(-60); // 2 months expired -> 50% surcharge

        var query = new CalculateApplicationFeesQuery(
            ApplicationId: app.Id,
            ValidityYears: 1,
            ExpirationDate: expiration
        );

        _repositoryMock
            .Setup(r => r.GetByIdWithDetailsAsync(app.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(app);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Succeeded.Should().BeTrue();
        result.Data.Should().NotBeNull();
        // 1RTG 180 + Surcharge (50% of 180 = 90) + 30 DST = 300
        result.Data!.SubTotal.Should().Be(180.00m);
        result.Data.SurchargeAmount.Should().Be(90.00m);
        result.Data.TotalAmount.Should().Be(300.00m);
    }
}
