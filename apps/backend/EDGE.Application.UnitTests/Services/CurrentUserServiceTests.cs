using System.Collections.Generic;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Xunit;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Services;

public class CurrentUserServiceTests
{
    private static IConfiguration CreateConfiguration(
        string? authority = "https://easy-snipe-36.clerk.accounts.dev",
        string[]? validIssuers = null,
        string[]? trustedDomains = null)
    {
        var configValues = new Dictionary<string, string?>();

        if (authority != null)
        {
            configValues["Clerk:Authority"] = authority;
        }

        validIssuers ??= new[]
        {
            "https://easy-snipe-36.clerk.accounts.dev",
            "https://wired-boar-76.clerk.accounts.dev"
        };

        for (var i = 0; i < validIssuers.Length; i++)
        {
            configValues[$"Clerk:ValidIssuers:{i}"] = validIssuers[i];
        }

        trustedDomains ??= new[]
        {
            ".clerk.accounts.dev",
            "clerk.accounts.dev",
            ".clerk.com",
            "clerk.edge.ntc.gov.ph"
        };

        for (var i = 0; i < trustedDomains.Length; i++)
        {
            configValues[$"Clerk:TrustedIssuerDomains:{i}"] = trustedDomains[i];
        }

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();
    }

    private static IHttpContextAccessor CreateHttpContextAccessor(
        IEnumerable<Claim>? claims = null,
        bool isAuthenticated = true)
    {
        var identity = isAuthenticated
            ? new ClaimsIdentity(claims ?? new List<Claim>(), "Bearer")
            : new ClaimsIdentity();

        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };

        return new HttpContextAccessor { HttpContext = httpContext };
    }

    // ─── Tests for IsTrustedClerkIssuer ─────────────────────────────────────────

    [Theory]
    [InlineData("https://easy-snipe-36.clerk.accounts.dev")]
    [InlineData("https://easy-snipe-36.clerk.accounts.dev/")]
    public void IsTrustedClerkIssuer_WhenIssuerMatchesConfiguredAuthority_ReturnsTrue(string issuer)
    {
        // Arrange
        var config = CreateConfiguration(authority: "https://easy-snipe-36.clerk.accounts.dev");
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", issuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeTrue();
    }

    [Theory]
    [InlineData("https://wired-boar-76.clerk.accounts.dev")]
    [InlineData("https://wired-boar-76.clerk.accounts.dev/")]
    public void IsTrustedClerkIssuer_WhenIssuerMatchesValidIssuers_ReturnsTrue(string issuer)
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", issuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeTrue();
    }

    [Fact]
    public void IsTrustedClerkIssuer_WhenIssuerMatchesAuthorityHost_ReturnsTrue()
    {
        // Arrange
        var config = CreateConfiguration(authority: "https://custom.clerk.agency.internal/v1");
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", "https://custom.clerk.agency.internal/v2") });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeTrue();
    }

    [Theory]
    [InlineData("https://tenant-alpha.clerk.accounts.dev")]
    [InlineData("https://production-subdomain.clerk.com")]
    [InlineData("https://clerk.edge.ntc.gov.ph")]
    public void IsTrustedClerkIssuer_WhenIssuerMatchesTrustedIssuerDomains_ReturnsTrue(string issuer)
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", issuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeTrue();
    }

    [Theory]
    [InlineData("https://evil-attacker.com")]
    [InlineData("https://accounts.google.com")]
    [InlineData("https://login.microsoftonline.com/tenant-id/v2.0")]
    [InlineData("https://untrusted-idp.example.org")]
    public void IsTrustedClerkIssuer_WhenIssuerIsUntrustedExternalProvider_ReturnsFalse(string untrustedIssuer)
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", untrustedIssuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeFalse();
    }

    [Theory]
    [InlineData("https://clerk.accounts.dev.evil-phishing.com")]
    [InlineData("https://fakeclerk.com")]
    [InlineData("https://clerk.edge.ntc.gov.ph.attacker.net")]
    public void IsTrustedClerkIssuer_WhenDomainSpoofingAttempted_ReturnsFalse(string spoofedIssuer)
    {
        // Arrange: Domain contains trusted substring but resolves to an external malicious host
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", spoofedIssuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert: Must safely reject spoofed domains
        service.IsTrustedClerkIssuer().Should().BeFalse();
    }

    [Theory]
    [InlineData("not-a-valid-uri")]
    [InlineData("")]
    [InlineData("   ")]
    public void IsTrustedClerkIssuer_WhenIssuerIsMalformedOrEmpty_ReturnsFalse(string malformedIssuer)
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", malformedIssuer) });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeFalse();
    }

    [Fact]
    public void IsTrustedClerkIssuer_WhenNoIssuerClaimExists_ReturnsFalse()
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[] { new Claim(ClaimTypes.Email, "staff@ntcedge.com") });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsTrustedClerkIssuer().Should().BeFalse();
    }

    [Fact]
    public void IsTrustedClerkIssuer_WhenConfigurationIsNull_ReturnsFalse()
    {
        // Arrange: Service initialized without configuration
        var accessor = CreateHttpContextAccessor(new[] { new Claim("iss", "https://easy-snipe-36.clerk.accounts.dev") });
        var service = new CurrentUserService(accessor, configuration: null);

        // Act & Assert: Cannot verify authority or trusted domains without config
        service.IsTrustedClerkIssuer().Should().BeFalse();
    }

    // ─── Tests for IsEmailVerified Integration ──────────────────────────────────

    [Theory]
    [InlineData("true")]
    [InlineData("True")]
    public void IsEmailVerified_WhenEmailVerifiedClaimIsTrue_ReturnsTrue(string claimValue)
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "staff@ntcedge.com"),
            new Claim("email_verified", claimValue)
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeTrue();
    }

    [Fact]
    public void IsEmailVerified_WhenEmailVerificationStatusIsVerified_ReturnsTrue()
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "staff@ntcedge.com"),
            new Claim("email_verification_status", "verified")
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeTrue();
    }

    [Theory]
    [InlineData("false")]
    [InlineData("False")]
    public void IsEmailVerified_WhenEmailVerifiedClaimIsFalse_ReturnsFalse_EvenIfIssuerIsClerk(string claimValue)
    {
        // Arrange: Explicit false must NOT be bypassed by Clerk fallback
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "unverified@ntcedge.com"),
            new Claim("email_verified", claimValue),
            new Claim("iss", "https://easy-snipe-36.clerk.accounts.dev")
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeFalse();
    }

    [Theory]
    [InlineData("unverified")]
    [InlineData("pending")]
    [InlineData("failed")]
    public void IsEmailVerified_WhenStatusIsNegative_ReturnsFalse_EvenIfIssuerIsClerk(string status)
    {
        // Arrange: Explicit unverified status must NOT be bypassed
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "unverified@ntcedge.com"),
            new Claim("email_verification_status", status),
            new Claim("iss", "https://easy-snipe-36.clerk.accounts.dev")
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeFalse();
    }

    [Fact]
    public void IsEmailVerified_WhenClaimOmitted_AndIssuerIsTrustedClerk_ReturnsTrue()
    {
        // Arrange: Standard Clerk token without custom claim returns true
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "staff@ntcedge.com"),
            new Claim("iss", "https://easy-snipe-36.clerk.accounts.dev")
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeTrue();
    }

    [Fact]
    public void IsEmailVerified_WhenClaimOmitted_AndIssuerIsUntrusted_ReturnsFalse()
    {
        // Arrange: Third-party/untrusted token without verified claim returns false
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(new[]
        {
            new Claim(ClaimTypes.Email, "victim@ntcedge.com"),
            new Claim("iss", "https://untrusted-external-idp.com")
        });
        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeFalse();
    }

    [Fact]
    public void IsEmailVerified_WhenUserIsUnauthenticated_ReturnsFalse()
    {
        // Arrange
        var config = CreateConfiguration();
        var accessor = CreateHttpContextAccessor(
            claims: new[]
            {
                new Claim(ClaimTypes.Email, "guest@ntcedge.com"),
                new Claim("iss", "https://easy-snipe-36.clerk.accounts.dev")
            },
            isAuthenticated: false);

        var service = new CurrentUserService(accessor, config);

        // Act & Assert
        service.IsEmailVerified.Should().BeFalse();
    }
}
