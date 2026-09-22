using EDGE.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace EDGE.Application.UnitTests.Users;

public class UserAutoLinkTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("user_client123")]
    [InlineData("user_evaluator123")]
    [InlineData("user_superadmin123")]
    [InlineData("user_director123")]
    [InlineData("seed_test_account")]
    [InlineData("temp_admin_id")]
    public void IsEligibleForAutoLink_WithUnlinkedOrSeedPlaceholders_ReturnsTrue(string? authUserId)
    {
        // Arrange
        var user = new User
        {
            AuthUserId = authUserId ?? string.Empty,
            Email = "test@ntcedge.com"
        };

        // Act & Assert
        user.IsEligibleForAutoLink().Should().BeTrue();
    }

    [Theory]
    [InlineData("user_2t47xLpM89K2nQ90")]
    [InlineData("user_3u98vXyZ12345678")]
    [InlineData("auth0|6098234790184")]
    [InlineData("clerk_live_user_99")]
    public void IsEligibleForAutoLink_WithLiveClaimedExternalIdentity_ReturnsFalse(string authUserId)
    {
        // Arrange
        var user = new User
        {
            AuthUserId = authUserId,
            Email = "claimed@ntcedge.com"
        };

        // Act & Assert
        user.IsEligibleForAutoLink().Should().BeFalse();
    }

    [Fact]
    public void TryLinkExternalAuthUserId_WhenEligible_UpdatesAuthUserIdAndReturnsTrue()
    {
        // Arrange
        var user = new User
        {
            AuthUserId = "user_evaluator123",
            Email = "evaluator@ntcedge.com"
        };

        // Act
        var result = user.TryLinkExternalAuthUserId("user_2t47xRealClerkId");

        // Assert
        result.Should().BeTrue();
        user.AuthUserId.Should().Be("user_2t47xRealClerkId");
    }

    [Fact]
    public void TryLinkExternalAuthUserId_WhenAlreadyClaimedByDifferentLiveIdentity_RejectsLinkingAndReturnsFalse()
    {
        // Arrange
        var user = new User
        {
            AuthUserId = "user_2t47xExistingLiveClerkId",
            Email = "evaluator@ntcedge.com"
        };

        // Act
        var result = user.TryLinkExternalAuthUserId("user_99999DifferentAttackerClerkId");

        // Assert
        result.Should().BeFalse();
        user.AuthUserId.Should().Be("user_2t47xExistingLiveClerkId"); // Unchanged
    }

    [Fact]
    public void TryLinkExternalAuthUserId_WhenIncomingIdMatchesCurrent_ReturnsTrueWithoutChanges()
    {
        // Arrange
        var user = new User
        {
            AuthUserId = "user_2t47xSameClerkId",
            Email = "evaluator@ntcedge.com"
        };

        // Act
        var result = user.TryLinkExternalAuthUserId("user_2t47xSameClerkId");

        // Assert
        result.Should().BeTrue();
        user.AuthUserId.Should().Be("user_2t47xSameClerkId");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void TryLinkExternalAuthUserId_WithNullOrEmptyIncomingId_ReturnsFalse(string? incomingId)
    {
        // Arrange
        var user = new User
        {
            AuthUserId = "user_evaluator123",
            Email = "evaluator@ntcedge.com"
        };

        // Act
        var result = user.TryLinkExternalAuthUserId(incomingId!);

        // Assert
        result.Should().BeFalse();
        user.AuthUserId.Should().Be("user_evaluator123");
    }
}
