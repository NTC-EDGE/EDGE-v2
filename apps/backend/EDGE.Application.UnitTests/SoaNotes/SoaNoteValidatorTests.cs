using System;
using FluentAssertions;
using Xunit;
using EDGE.Application.SoaNotes.Commands.CreateSoaNote;
using EDGE.Application.SoaNotes.Commands.UpdateSoaNote;

namespace EDGE.Application.UnitTests.SoaNotes;

public class SoaNoteValidatorTests
{
    [Fact]
    public void CreateSoaNoteCommandValidator_ShouldFail_WhenNotesEmpty()
    {
        var validator = new CreateSoaNoteCommandValidator();
        var command = new CreateSoaNoteCommand("", "CODE", "Title");

        var result = validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Notes");
    }

    [Fact]
    public void CreateSoaNoteCommandValidator_ShouldPass_WhenValid()
    {
        var validator = new CreateSoaNoteCommandValidator();
        var command = new CreateSoaNoteCommand("Valid terms content", "TERMS_01", "Standard Terms");

        var result = validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateSoaNoteCommandValidator_ShouldFail_WhenIdEmpty()
    {
        var validator = new UpdateSoaNoteCommandValidator();
        var command = new UpdateSoaNoteCommand(Guid.Empty, "Valid notes", "CODE", "Title");

        var result = validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Id");
    }

    [Fact]
    public void UpdateSoaNoteCommandValidator_ShouldPass_WhenValid()
    {
        var validator = new UpdateSoaNoteCommandValidator();
        var command = new UpdateSoaNoteCommand(Guid.NewGuid(), "Valid updated terms", "NEW_CODE", "New Title");

        var result = validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }
}
