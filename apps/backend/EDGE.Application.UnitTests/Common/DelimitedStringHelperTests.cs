using System;
using System.Collections.Generic;
using EDGE.Application.Common.Helpers;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Common;

public class DelimitedStringHelperTests
{
    [Fact]
    public void SplitDelimited_WithNullOrWhitespace_ReturnsEmpty()
    {
        DelimitedStringHelper.SplitDelimited(null).Should().BeEmpty();
        DelimitedStringHelper.SplitDelimited("").Should().BeEmpty();
        DelimitedStringHelper.SplitDelimited("   ").Should().BeEmpty();
    }

    [Fact]
    public void SplitDelimited_WithCommasAndSemicolons_SplitsAndTrimsTokens()
    {
        var result = DelimitedStringHelper.SplitDelimited(" OR-1001 , OR-1002 ; OR-1003, ");
        result.Should().Equal("OR-1001", "OR-1002", "OR-1003");
    }

    [Fact]
    public void ParseDistinctTokens_WithDuplicatesAndCasing_DeduplicatesCaseInsensitive()
    {
        var inputs = new List<string?> { "OR-1001, OR-1002", "or-1001", null, "OR-1003; or-1002" };
        var result = DelimitedStringHelper.ParseDistinctTokens(inputs);
        result.Should().Equal("OR-1001", "OR-1002", "OR-1003");
    }

    [Fact]
    public void FormatOrDisplay_WithValidInputs_ReturnsJoinedString()
    {
        var formatted = DelimitedStringHelper.FormatOrDisplay(new[] { "OR-1001, ", "OR-1002; OR-1001" });
        formatted.Should().Be("OR-1001, OR-1002");
    }

    [Fact]
    public void FormatOrDisplay_WithEmptyInputs_ReturnsNull()
    {
        var formatted = DelimitedStringHelper.FormatOrDisplay(new[] { "", "  ", null });
        formatted.Should().BeNull();
    }
}
