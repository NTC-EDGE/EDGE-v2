using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;
using EDGE.Application.Applications.Commands.CreateSoa;

namespace EDGE.Application.UnitTests.Applications;

public class CreateSoaCommandValidatorTests
{
    private readonly CreateSoaCommandValidator _validator = new();

    [Fact]
    public async Task Validate_ValidCommand_PassesValidation()
    {
        var command = new CreateSoaCommand(
            ApplicationId: Guid.NewGuid(),
            ApplicantId: Guid.NewGuid(),
            IssuedToType: "Individual",
            IssuedToName: "John Doe",
            IssuedToAddress: "123 Main St",
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: new List<CreateSoaLineItemRequest>
            {
                new CreateSoaLineItemRequest(
                    Particular: "Radio Operator Certificate Fee",
                    ItemCode: "ROC-01",
                    Description: "Annual statutory fee",
                    PeriodOfCoverageStart: DateTime.UtcNow,
                    PeriodOfCoverageEnd: DateTime.UtcNow.AddYears(1),
                    ValidityYears: 1,
                    NoOfUnits: 2,
                    FeeRate: 500m,
                    Amount: 1000m
                )
            },
            ValidityYears: 1,
            NoOfUnits: 2
        );

        var result = await _validator.ValidateAsync(command);
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public async Task Validate_EmptyApplicationId_FailsValidation()
    {
        var command = new CreateSoaCommand(
            ApplicationId: Guid.Empty,
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "John Doe",
            IssuedToAddress: null,
            DueDate: DateTime.UtcNow.AddDays(30)
        );

        var result = await _validator.ValidateAsync(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ApplicationId");
    }

    [Fact]
    public async Task Validate_NegativeUnitsOrFeeRate_FailsValidation()
    {
        var command = new CreateSoaCommand(
            ApplicationId: Guid.NewGuid(),
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "John Doe",
            IssuedToAddress: null,
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: new List<CreateSoaLineItemRequest>
            {
                new CreateSoaLineItemRequest(
                    Particular: "Test Fee",
                    ItemCode: "FEE",
                    Description: null,
                    PeriodOfCoverageStart: null,
                    PeriodOfCoverageEnd: null,
                    ValidityYears: 1,
                    NoOfUnits: -1,
                    FeeRate: -50m,
                    Amount: -50m
                )
            },
            NoOfUnits: -3,
            ValidityYears: -2
        );

        var result = await _validator.ValidateAsync(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName.Contains("NoOfUnits"));
        result.Errors.Should().Contain(e => e.PropertyName.Contains("FeeRate"));
        result.Errors.Should().Contain(e => e.PropertyName.Contains("ValidityYears"));
    }

    [Fact]
    public async Task Validate_DuplicateParticulars_FailsValidationWithExactMessage()
    {
        var command = new CreateSoaCommand(
            ApplicationId: Guid.NewGuid(),
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "Jane Doe",
            IssuedToAddress: null,
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: new List<CreateSoaLineItemRequest>
            {
                new CreateSoaLineItemRequest(
                    Particular: "Inspection Fee",
                    ItemCode: "4-02-01-100",
                    Description: null,
                    PeriodOfCoverageStart: null,
                    PeriodOfCoverageEnd: null,
                    ValidityYears: 1,
                    NoOfUnits: 1,
                    FeeRate: 600m,
                    Amount: 600m
                ),
                new CreateSoaLineItemRequest(
                    Particular: "inspection fee",
                    ItemCode: "4-02-01-100",
                    Description: null,
                    PeriodOfCoverageStart: null,
                    PeriodOfCoverageEnd: null,
                    ValidityYears: 1,
                    NoOfUnits: 1,
                    FeeRate: 600m,
                    Amount: 600m
                )
            }
        );

        var result = await _validator.ValidateAsync(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Particular already exist.");
    }

    [Fact]
    public async Task Validate_DuplicateOthersParticulars_FailsValidationWithExactMessage()
    {
        var command = new CreateSoaCommand(
            ApplicationId: Guid.NewGuid(),
            ApplicantId: null,
            IssuedToType: "Individual",
            IssuedToName: "Jane Doe",
            IssuedToAddress: null,
            DueDate: DateTime.UtcNow.AddDays(30),
            LineItems: new List<CreateSoaLineItemRequest>
            {
                new CreateSoaLineItemRequest(
                    Particular: "Others: Penalty for late delivery",
                    ItemCode: "4-02-01-990",
                    Description: "Penalty",
                    PeriodOfCoverageStart: null,
                    PeriodOfCoverageEnd: null,
                    ValidityYears: 1,
                    NoOfUnits: 1,
                    FeeRate: 250m,
                    Amount: 250m
                ),
                new CreateSoaLineItemRequest(
                    Particular: "Others: Storage Demurrage",
                    ItemCode: "4-02-01-990",
                    Description: "Storage",
                    PeriodOfCoverageStart: null,
                    PeriodOfCoverageEnd: null,
                    ValidityYears: 1,
                    NoOfUnits: 1,
                    FeeRate: 500m,
                    Amount: 500m
                )
            }
        );

        var result = await _validator.ValidateAsync(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Particular already exist.");
    }
}
