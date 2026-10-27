using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.ServiceVariantElementFees.Queries.GetServiceVariantElementFees;
using EDGE.Application.ServiceVariantFees.Queries.GetServiceVariantFees;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Fees;

public class ServiceVariantFeesQueryHandlerTests
{
    private readonly Mock<IServiceVariantFeeRepository> _feeRepoMock = new();
    private readonly Mock<IServiceVariantFormulaRepository> _formulaRepoMock = new();
    private readonly Mock<IServiceVariantElementFeeRepository> _elemFeeRepoMock = new();

    private readonly Service _amateurService;
    private readonly Service _examService;
    private readonly ServiceVariant _variantNew;
    private readonly ServiceVariant _variantRenewal;
    private readonly Fee _feeRoc;
    private readonly Element _elem1Rtg;
    private readonly Element _elem2Rtg;

    public ServiceVariantFeesQueryHandlerTests()
    {
        _amateurService = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Amateur Radio Service",
            Code = "NTC-LIC-AMA"
        };

        _examService = new Service
        {
            Id = Guid.NewGuid(),
            Name = "Radio Operator Examination",
            Code = "NTC-EXAM-RTG"
        };

        _variantNew = new ServiceVariant
        {
            Id = Guid.NewGuid(),
            ServiceId = _amateurService.Id,
            Service = _amateurService,
            Type = ServiceVariantType.New,
            Description = "Amateur Radio Station License"
        };

        _variantRenewal = new ServiceVariant
        {
            Id = Guid.NewGuid(),
            ServiceId = _amateurService.Id,
            Service = _amateurService,
            Type = ServiceVariantType.Renewal,
            Description = "Amateur Radio Station License Renewal"
        };

        _feeRoc = new Fee
        {
            Id = Guid.NewGuid(),
            Code = "ROC",
            Name = "Radio Operator Certificate Fee"
        };

        _elem1Rtg = new Element
        {
            Id = Guid.NewGuid(),
            Code = "1RTG",
            Name = "First Class Radiotelegraph"
        };

        _elem2Rtg = new Element
        {
            Id = Guid.NewGuid(),
            Code = "2RTG",
            Name = "Second Class Radiotelegraph"
        };
    }

    [Fact]
    public async Task GetServiceVariantFees_ShouldIncludeVariantNameAndApplicationType()
    {
        var fees = new List<ServiceVariantFee>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = _variantNew.Id,
                ServiceVariant = _variantNew,
                FeeId = _feeRoc.Id,
                Fee = _feeRoc,
                Amount = 180m,
                IsActive = true
            }
        };

        _feeRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(fees);

        _formulaRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantFormula>());

        var handler = new GetServiceVariantFeesQueryHandler(_feeRepoMock.Object, _formulaRepoMock.Object);
        var query = new GetServiceVariantFeesQuery();

        var result = await handler.Handle(query, CancellationToken.None);

        result.Data.Should().HaveCount(1);
        var group = result.Data.First();
        group.VariantName.Should().Be("Amateur Radio Station License");
        group.ApplicationType.Should().Be("New");
        group.ServiceName.Should().Be("Amateur Radio Service");
        group.TotalBaseAmount.Should().Be(180m);
    }

    [Fact]
    public async Task GetServiceVariantFees_ShouldFilterBySearchTermMatchingDescription()
    {
        var fees = new List<ServiceVariantFee>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = _variantNew.Id,
                ServiceVariant = _variantNew,
                FeeId = _feeRoc.Id,
                Fee = _feeRoc,
                Amount = 180m,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = _variantRenewal.Id,
                ServiceVariant = _variantRenewal,
                FeeId = _feeRoc.Id,
                Fee = _feeRoc,
                Amount = 180m,
                IsActive = true
            }
        };

        _feeRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(fees);

        _formulaRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantFormula>());

        var handler = new GetServiceVariantFeesQueryHandler(_feeRepoMock.Object, _formulaRepoMock.Object);
        var query = new GetServiceVariantFeesQuery(SearchTerm: "Renewal");

        var result = await handler.Handle(query, CancellationToken.None);

        result.Data.Should().HaveCount(1);
        result.Data.First().ApplicationType.Should().Be("Renewal");
    }

    [Fact]
    public async Task GetServiceVariantElementFees_ShouldCalculatePerElementRate_NotSumAllElements()
    {
        // 2 elements mapped to the same service variant, each with 180 fee
        var elemFees = new List<ServiceVariantElementFee>
        {
            new()
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = _variantNew.Id,
                ServiceVariant = _variantNew,
                ElementId = _elem1Rtg.Id,
                Element = _elem1Rtg,
                FeeId = _feeRoc.Id,
                Fee = _feeRoc,
                Amount = 180m,
                IsActive = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                ServiceVariantId = _variantNew.Id,
                ServiceVariant = _variantNew,
                ElementId = _elem2Rtg.Id,
                Element = _elem2Rtg,
                FeeId = _feeRoc.Id,
                Fee = _feeRoc,
                Amount = 180m,
                IsActive = true
            }
        };

        _elemFeeRepoMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(elemFees);

        _formulaRepoMock
            .Setup(r => r.GetAllElementFormulasAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ServiceVariantElementFormula>());

        var handler = new GetServiceVariantElementFeesQueryHandler(_elemFeeRepoMock.Object, _formulaRepoMock.Object);
        var query = new GetServiceVariantElementFeesQuery();

        var result = await handler.Handle(query, CancellationToken.None);

        result.Data.Should().HaveCount(1);
        var group = result.Data.First();
        // Since an applicant selects one element during SOA generation,
        // base rate per element is 180, NOT 360 (180 + 180)!
        group.TotalBaseAmount.Should().Be(180m);
        group.ElementFees.Should().HaveCount(2);
        group.VariantName.Should().Be("Amateur Radio Station License");
        group.ApplicationType.Should().Be("New");
    }
}
