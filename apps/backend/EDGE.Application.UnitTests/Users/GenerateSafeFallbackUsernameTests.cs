using System.Text.RegularExpressions;
using EDGE.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Users;

public class GenerateSafeFallbackUsernameTests
{
    [Fact]
    public void GenerateSafeFallbackUsername_WithFirstAndLastName_ReturnsCombinedLowercaseWithSuffix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("John", "Doe", null);

        // Assert
        username.Should().MatchRegex(@"^john_doe_[a-f0-9]{6}$");
        username.Length.Should().BeInRange(4, 64);
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithSpecialCharacters_StripsNonAlphanumeric()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("Juan-Carlos!", "@O'Connor#", "test@domain.com");

        // Assert
        username.Should().MatchRegex(@"^juancarlos_oconnor_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithFirstNameOnly_ReturnsFirstNameWithSuffix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("Alice", null, null);

        // Assert
        username.Should().MatchRegex(@"^alice_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithLastNameOnly_ReturnsLastNameWithSuffix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername(null, "Smith", null);

        // Assert
        username.Should().MatchRegex(@"^smith_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithWhitespaceNames_FallsBackToEmailPrefix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("   ", "   ", "maria.santos@ntc.gov.ph");

        // Assert
        username.Should().MatchRegex(@"^mariasantos_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithNullNames_FallsBackToEmailPrefix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername(null, null, "user.test+tag@example.com");

        // Assert
        username.Should().MatchRegex(@"^usertesttag_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithShortSingleName_AppendsUserSuffixForMinBaseLength()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("A", null, null);

        // Assert
        username.Should().MatchRegex(@"^auser_[a-f0-9]{6}$");
        username.Length.Should().BeGreaterThanOrEqualTo(4);
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithShortFirstAndLastName_MaintainsValidStructure()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("A", "B", null);

        // Assert
        username.Should().MatchRegex(@"^a_b_[a-f0-9]{6}$");
        username.Length.Should().BeGreaterThanOrEqualTo(4);
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithAllNullOrEmpty_FallsBackToUserPrefix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername(null, null, null);

        // Assert
        username.Should().MatchRegex(@"^user_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithSymbolOnlyEmail_FallsBackToUserPrefix()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("", "", "@@@.com");

        // Assert
        username.Should().MatchRegex(@"^user_[a-f0-9]{6}$");
    }

    [Fact]
    public void GenerateSafeFallbackUsername_WithExtremelyLongNames_TruncatesTo64Characters()
    {
        // Arrange
        var longName = new string('a', 100);

        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername(longName, longName, null);

        // Assert
        username.Length.Should().BeLessThanOrEqualTo(64);
    }

    [Fact]
    public void GenerateSafeFallbackUsername_AlwaysProducesValidAlphanumericAndUnderscores()
    {
        // Act
        var username = ClerkUserService.GenerateSafeFallbackUsername("Élizabeth 123!", "D'Souza-Smith #456", "test@domain.com");

        // Assert
        Regex.IsMatch(username, @"^[a-z0-9_]+$").Should().BeTrue();
    }
}
