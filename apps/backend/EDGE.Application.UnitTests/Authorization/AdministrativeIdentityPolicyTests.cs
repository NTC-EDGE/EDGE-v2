using FluentAssertions;
using Xunit;
using EDGE.Domain.Authorization;

namespace EDGE.Application.UnitTests.Authorization;

public class AdministrativeIdentityPolicyTests
{
    [Theory]
    [InlineData("Admin", true)]
    [InlineData("administrator", true)]
    [InlineData("superadmin", true)]
    [InlineData("super_admin", true)]
    [InlineData("super-admin", true)]
    [InlineData("systemadmin", true)]
    [InlineData("system_admin", true)]
    [InlineData("tenantadmin", true)]
    [InlineData("tenant_admin", true)]
    [InlineData("tenant-admin", true)]
    [InlineData("regionaladmin", true)]
    [InlineData("regional_admin", true)]
    [InlineData("regional-admin", true)]
    [InlineData("regionaldirector", true)]
    [InlineData("regional_director", true)]
    [InlineData("regional-director", true)]
    [InlineData("Regional Director", true)]
    [InlineData("director", true)]
    [InlineData("evaluator", false)]
    [InlineData("accountant", false)]
    [InlineData("cashier", false)]
    [InlineData("applicant", false)]
    [InlineData(null, false)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    public void IsAdministrativeRole_ShouldCorrectlyIdentifyAdministrativeRoles(string? roleKey, bool expected)
    {
        // Act
        var result = AdministrativeIdentityPolicy.IsAdministrativeRole(roleKey);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("superadmin", true)]
    [InlineData("super_admin", true)]
    [InlineData("super-admin", true)]
    [InlineData("SuperAdmin", true)]
    [InlineData("Super Administrator", true)]
    [InlineData("superadministrator", true)]
    [InlineData("org:superadmin", true)]
    [InlineData("org:super_admin", true)]
    [InlineData("org:super-admin", true)]
    [InlineData("admin", false)]
    [InlineData("tenantadmin", false)]
    [InlineData("regionaldirector", false)]
    [InlineData(null, false)]
    [InlineData("", false)]
    public void IsSuperAdminRole_ShouldOnlyMatchSuperAdminRoles(string? roleKey, bool expected)
    {
        // Act
        var result = AdministrativeIdentityPolicy.IsSuperAdminRole(roleKey);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("admin@ntcedge.com", true)]
    [InlineData("superadmin@ntcedge.com", true)]
    [InlineData("ADMIN@NTCEDGE.COM", true)]
    [InlineData(" superadmin@ntcedge.com ", true)]
    [InlineData("staff@ntcedge.com", false)]
    [InlineData("user@example.com", false)]
    [InlineData(null, false)]
    [InlineData("", false)]
    public void IsAdministrativeEmail_ShouldMatchKnownSeedEmails(string? email, bool expected)
    {
        // Act
        var result = AdministrativeIdentityPolicy.IsAdministrativeEmail(email);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData("superadmin@ntcedge.com", true)]
    [InlineData("SUPERADMIN@NTCEDGE.COM", true)]
    [InlineData("admin@ntcedge.com", false)]
    [InlineData("director@ntcedge.com", false)]
    [InlineData(null, false)]
    public void IsSuperAdminEmail_ShouldMatchSuperAdminOnly(string? email, bool expected)
    {
        // Act
        var result = AdministrativeIdentityPolicy.IsSuperAdminEmail(email);

        // Assert
        result.Should().Be(expected);
    }
}
