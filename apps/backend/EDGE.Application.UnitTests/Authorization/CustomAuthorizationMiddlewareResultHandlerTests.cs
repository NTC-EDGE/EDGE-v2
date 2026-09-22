using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Domain.Authorization;
using EDGE.Infrastructure.Authorization;

namespace EDGE.Application.UnitTests.Authorization;

public class CustomAuthorizationMiddlewareResultHandlerTests
{
    private readonly Mock<ILogger<CustomAuthorizationMiddlewareResultHandler>> _loggerMock = new();
    private readonly CustomAuthorizationMiddlewareResultHandler _handler;

    public CustomAuthorizationMiddlewareResultHandlerTests()
    {
        _handler = new CustomAuthorizationMiddlewareResultHandler(_loggerMock.Object);
    }

    private static (DefaultHttpContext context, MemoryStream responseStream) CreateHttpContext(string userIdentifier = "test-user-123")
    {
        var context = new DefaultHttpContext();
        var responseStream = new MemoryStream();
        context.Response.Body = responseStream;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userIdentifier),
            new Claim(ClaimTypes.Name, "Test User")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        context.User = new ClaimsPrincipal(identity);
        context.Request.Method = "POST";
        context.Request.Path = "/api/v1/users";

        return (context, responseStream);
    }

    [Fact]
    public async Task HandleAsync_WhenForbiddenWithMissingPermissions_ShouldReturn403AndCorrectJsonDetail()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var policy = new AuthorizationPolicyBuilder()
            .AddRequirements(new PermissionRequirement(Permissions.ManageUsers), new PermissionRequirement(Permissions.AssignRolePermissions))
            .Build();
        var result = PolicyAuthorizationResult.Forbid();
        var nextInvoked = false;
        RequestDelegate next = _ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        };

        // Act
        await _handler.HandleAsync(next, context, policy, result);

        // Assert
        nextInvoked.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        context.Response.ContentType.Should().Be("application/json");

        stream.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();
        json.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("succeeded").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(StatusCodes.Status403Forbidden);
        root.GetProperty("title").GetString().Should().Be("Access Denied");
        root.GetProperty("detail").GetString().Should().Contain(Permissions.ManageUsers);
        root.GetProperty("detail").GetString().Should().Contain(Permissions.AssignRolePermissions);

        var permissions = new List<string>();
        foreach (var element in root.GetProperty("requiredPermissions").EnumerateArray())
        {
            permissions.Add(element.GetString()!);
        }
        permissions.Should().Contain(new[] { Permissions.ManageUsers, Permissions.AssignRolePermissions });
    }

    [Fact]
    public async Task HandleAsync_WhenForbiddenWithMissingRoles_ShouldReturn403AndCorrectRoleDetail()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var policy = new AuthorizationPolicyBuilder()
            .AddRequirements(new RoleRequirement("system_admin"))
            .Build();
        var result = PolicyAuthorizationResult.Forbid();
        var nextInvoked = false;
        RequestDelegate next = _ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        };

        // Act
        await _handler.HandleAsync(next, context, policy, result);

        // Assert
        nextInvoked.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        context.Response.ContentType.Should().Be("application/json");

        stream.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();
        json.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("succeeded").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(StatusCodes.Status403Forbidden);
        root.GetProperty("title").GetString().Should().Be("Access Denied");
        root.GetProperty("detail").GetString().Should().Contain("system_admin");

        var roles = new List<string>();
        foreach (var element in root.GetProperty("requiredRoles").EnumerateArray())
        {
            roles.Add(element.GetString()!);
        }
        roles.Should().ContainSingle().Which.Should().Be("system_admin");
    }

    [Fact]
    public async Task HandleAsync_WhenForbiddenWithNoRequirements_ShouldReturn403AndGenericFallbackDetail()
    {
        // Arrange
        var (context, stream) = CreateHttpContext();
        var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
        var result = PolicyAuthorizationResult.Forbid();
        var nextInvoked = false;
        RequestDelegate next = _ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        };

        // Act
        await _handler.HandleAsync(next, context, policy, result);

        // Assert
        nextInvoked.Should().BeFalse();
        context.Response.StatusCode.Should().Be(StatusCodes.Status403Forbidden);
        context.Response.ContentType.Should().Be("application/json");

        stream.Seek(0, SeekOrigin.Begin);
        using var reader = new StreamReader(stream);
        var json = await reader.ReadToEndAsync();
        json.Should().NotBeNullOrWhiteSpace();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        root.GetProperty("succeeded").GetBoolean().Should().BeFalse();
        root.GetProperty("statusCode").GetInt32().Should().Be(StatusCodes.Status403Forbidden);
        root.GetProperty("title").GetString().Should().Be("Access Denied");
        root.GetProperty("detail").GetString().Should().Be("Access Denied: You do not have permission to access this resource or perform this action. Please contact your system administrator.");
        root.GetProperty("requiredPermissions").GetArrayLength().Should().Be(0);
        root.GetProperty("requiredRoles").GetArrayLength().Should().Be(0);
    }

    [Fact]
    public async Task HandleAsync_WhenAuthorizationSucceeded_ShouldInvokeNextDelegate()
    {
        // Arrange
        var (context, _) = CreateHttpContext();
        var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
        var result = PolicyAuthorizationResult.Success();
        var nextInvoked = false;
        RequestDelegate next = _ =>
        {
            nextInvoked = true;
            return Task.CompletedTask;
        };

        // Act
        await _handler.HandleAsync(next, context, policy, result);

        // Assert
        nextInvoked.Should().BeTrue();
        context.Response.StatusCode.Should().Be(StatusCodes.Status200OK);
    }
}
