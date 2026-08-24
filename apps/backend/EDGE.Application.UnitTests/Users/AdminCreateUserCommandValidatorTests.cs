using FluentAssertions;
using Xunit;
using EDGE.Application.Users.Commands.AdminCreateUser;

namespace EDGE.Application.UnitTests.Users;

public class AdminCreateUserCommandValidatorTests
{
    private readonly AdminCreateUserCommandValidator _validator = new();

    [Fact]
    public void Validate_ShouldPass_WhenAllRequiredFieldsAreValid()
    {
        var command = new AdminCreateUserCommand(
            Email: "staff.evaluator@ntc.gov.ph",
            FirstName: "Maria",
            LastName: "Santos",
            RoleKey: "evaluator"
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-an-email")]
    public void Validate_ShouldFail_WhenEmailIsInvalid(string email)
    {
        var command = new AdminCreateUserCommand(
            Email: email,
            FirstName: "Maria",
            LastName: "Santos",
            RoleKey: "evaluator"
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_ShouldFail_WhenFirstNameOrLastNameIsEmpty(string emptyVal)
    {
        var command = new AdminCreateUserCommand(
            Email: "test@example.com",
            FirstName: emptyVal,
            LastName: emptyVal,
            RoleKey: "evaluator"
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FirstName");
        result.Errors.Should().Contain(e => e.PropertyName == "LastName");
    }

    [Fact]
    public void Validate_ShouldFail_WhenPasswordIsTooShort()
    {
        var command = new AdminCreateUserCommand(
            Email: "test@example.com",
            FirstName: "Maria",
            LastName: "Santos",
            Password: "short",
            RoleKey: "evaluator"
        );

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }
}
