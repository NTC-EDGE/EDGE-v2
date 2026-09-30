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
        var dstFee = new Fee { Id = Guid.NewGuid(), Code = "DST", Name = "Documentary Stamp Tax", Description = "Documentary Stamp Tax" };

        var dynamicVariantFee = new ServiceVariantFee
        {
            Id = Guid.NewGuid(),
            ServiceVariantId = variantId,
            FeeId = fee.Id,
            Fee = fee,
            Amount = 250.00m,
            IsActive = true
        };

        var dstVariantFee = new ServiceVariantFee
        {
            Id = Guid.NewGuid(),
            ServiceVariantId = variantId,
            FeeId = dstFee.Id,
            Fee = dstFee,
            Amount = 30.00m,
            IsActive = true
        };

        var request = new FeeCalculationRequest(
            Activity: "Custom Radio Service",
            ApplicationType: "Custom Variant",
            ValidityYears: 2,
            NoOfUnits: 3,
            FormulaExpression: "{RATE} * {YEARS} * {UNITS} + {DST}",
            VariantFees: new List<ServiceVariantFee> { dynamicVariantFee, dstVariantFee }
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

    [Theory]
    [InlineData("{RATE} * {YEARS} * {UNITS}")]
    [InlineData("TOTAL = (ROC)(YR) + DST")]
    [InlineData("FEEROC = FF + AF + (ROC)(YR) + DST + SUR")]
    [InlineData("TOTAL = ({RATE})(YEARS)(UNITS)")]
    [InlineData("(1RTG)(YR) + (2RTG)(YR) + DST")]
    [InlineData("RATE * YEARS + (NAS * 1000) + DST")]
    [InlineData("180 * YR + 30")]
    [InlineData("(RATE + 50) * 2")]
    public void Validate_ValidFormulas_ShouldReturnSuccess(string formula)
    {
        var (isValid, errorMessage) = DynamicFeeFormulaEvaluator.Validate(formula);

        isValid.Should().BeTrue();
        errorMessage.Should().BeNull();
    }

    [Theory]
    [InlineData("", "Formula expression cannot be empty.")]
    [InlineData("   ", "Formula expression cannot be empty.")]
    [InlineData("TOTAL = ", "Formula expression on the right side of '=' cannot be empty.")]
    [InlineData("TOTAL = A = B", "Formula cannot contain multiple assignment '=' operators.")]
    [InlineData("TOTAL$", "Formula contains unsupported character '$'")]
    [InlineData("RATE % 2", "Formula contains unsupported character '%'")]
    [InlineData("((RATE + DST)", "Unclosed opening parenthesis '('")]
    [InlineData("RATE + DST)", "Mismatched closing parenthesis ')'")]
    [InlineData("RATE + ()", "Empty parentheses '()' are not allowed in formula.")]
    [InlineData("{RATE", "Mismatched bracketed placeholders: every '{' must have a matching '}'.")]
    [InlineData("{RATE}}", "Mismatched bracketed placeholders: every '{' must have a matching '}'.")]
    [InlineData("* RATE", "Formula expression cannot start with multiplication or division operator.")]
    [InlineData("RATE +", "Formula expression cannot end with an arithmetic operator.")]
    [InlineData("RATE + + DST", "Invalid operator sequence: duplicate '+' operators are not allowed.")]
    [InlineData("RATE * / 2", "Invalid operator sequence: binary operators cannot be immediately followed by '*' or '/'.")]
    public void Validate_InvalidFormulas_ShouldFailWithDescriptiveError(string formula, string expectedErrorSubstring)
    {
        var (isValid, errorMessage) = DynamicFeeFormulaEvaluator.Validate(formula);

        isValid.Should().BeFalse();
        errorMessage.Should().NotBeNull();
        errorMessage.Should().Contain(expectedErrorSubstring);
    }
}
