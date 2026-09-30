using System;
using System.Collections.Generic;
using FluentAssertions;
using Xunit;
using EDGE.Application.Fees.Calculations;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Fees;

public class DynamicFeeFormulaEvaluatorTests
{
    [Theory]
    [InlineData("{RATE} * {YEARS} * {UNITS}", 180, 3, 2, 0, 1080.00)]
    [InlineData("{RATE} * {PAGES}", 2.50, 1, 1, 10, 25.00)]
    [InlineData("RATE * YR + DST", 120, 2, 1, 0, 270.00)]
    [InlineData("(ROC)(YR) + DST", 180, 1, 1, 0, 210.00)]
    [InlineData("RATE * YEARS + (NAS * 1000) + DST", 6000, 1, 1, 3, 9030.00)]
    public void Evaluate_Formulas_ShouldProduceExactExpectedAmount(
        string formula,
        decimal rate,
        int years,
        int units,
        int extraOrPages,
        decimal expectedTotal)
    {
        var result = DynamicFeeFormulaEvaluator.Evaluate(
            formula: formula,
            rate: rate,
            years: years,
            units: units,
            pages: extraOrPages,
            additionalServices: extraOrPages,
            dst: 30.00m
        );

        result.Should().Be(expectedTotal);
    }

    [Theory]
    [InlineData(180, true, 3, true, 2, false, 1, false, 1, 1080.00)]
    [InlineData(2.50, false, 1, false, 1, false, 1, true, 10, 25.00)]
    [InlineData(85, false, 1, true, 5, false, 1, false, 1, 425.00)]
    [InlineData(120, false, 1, false, 1, false, 1, false, 1, 120.00)]
    public void CalculateStandardMultiplier_ShouldComputeMultipliersCorrectly(
        decimal rate,
        bool multiYears,
        int years,
        bool multiUnits,
        int units,
        bool multiChannels,
        int channels,
        bool multiPages,
        int pages,
        decimal expectedAmount)
    {
        var result = DynamicFeeFormulaEvaluator.CalculateStandardMultiplier(
            baseRate: rate,
            multiYears: multiYears,
            years: years,
            multiUnits: multiUnits,
            units: units,
            multiChannels: multiChannels,
            channels: channels,
            multiPages: multiPages,
            pages: pages
        );

        result.Should().Be(expectedAmount);
    }

    [Fact]
    public void FeeCalculationEngine_ShouldExecuteDynamicDbVariantFees_WhenConfigured()
    {
        var engine = new FeeCalculationEngine(Array.Empty<IFeeCalculationStrategy>());

        var variantId = Guid.NewGuid();
        var fee = new Fee { Id = Guid.NewGuid(), Code = "CUSTOM_FEE", Name = "Custom Admin Tariff", Description = "Dynamic Tariff Test" };

        var dynamicVariantFee = new ServiceVariantFee
        {
            Id = Guid.NewGuid(),
            ServiceVariantId = variantId,
            FeeId = fee.Id,
            Fee = fee,
            Amount = 250.00m,
            CalculationMode = FeeCalculationMode.CustomFormula,
            CalculationFormula = "{RATE} * {YEARS} * {UNITS}",
            MultiplyByValidityYears = true,
            MultiplyByUnits = true,
            IncludeDst = true,
            DstAmount = 30.00m,
            IsActive = true
        };

        var request = new FeeCalculationRequest(
            Activity: "Custom Radio Service",
            ApplicationType: "Custom Variant",
            ValidityYears: 2,
            NoOfUnits: 3,
            VariantFees: new List<ServiceVariantFee> { dynamicVariantFee }
        );

        var result = engine.Calculate(request);

        result.Should().NotBeNull();
        // 250 * 2 * 3 = 1500 + 30 DST = 1530
        result.SubTotal.Should().Be(1500.00m);
        result.TaxAmount.Should().Be(30.00m);
        result.TotalAmount.Should().Be(1530.00m);
        result.LineItems.Should().HaveCount(2);
        result.LineItems.Should().Contain(li => li.ItemCode == "CUSTOM_FEE" && li.Amount == 1500.00m);
        result.LineItems.Should().Contain(li => li.ItemCode == "DST" && li.Amount == 30.00m);
    }
}
