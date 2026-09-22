using System;
using System.Collections.Generic;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Primitives;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace EDGE.Application.UnitTests.Tenants;

public class TenantContextServiceTests
{
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly ApplicationDbContext _dbContext;

    public TenantContextServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .Options;
        _dbContext = new ApplicationDbContext(options);
    }

    private DefaultHttpContext CreateHttpContext(
        RouteValueDictionary? routeValues = null,
        string path = "/",
        Dictionary<string, string>? queryParams = null,
        Dictionary<string, string>? headers = null)
    {
        var context = new DefaultHttpContext();
        context.Request.Path = path;

        if (routeValues != null)
        {
            context.Request.RouteValues = routeValues;
        }

        if (queryParams != null)
        {
            var queryCollection = new Dictionary<string, StringValues>();
            foreach (var kvp in queryParams)
            {
                queryCollection[kvp.Key] = new StringValues(kvp.Value);
            }
            context.Request.Query = new QueryCollection(queryCollection);
        }

        if (headers != null)
        {
            foreach (var kvp in headers)
            {
                context.Request.Headers[kvp.Key] = kvp.Value;
            }
        }

        return context;
    }

    [Fact]
    public void TenantId_ShouldReturnNull_WhenHttpContextIsNull()
    {
        // Arrange
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns((HttpContext?)null);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void TenantId_ShouldReturnNull_WhenNoTenantIdentifiersPresent()
    {
        // Arrange
        var context = CreateHttpContext();
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public void TenantId_ShouldPrioritizeTenantIdRouteParameter_OverAllOtherSources()
    {
        // Arrange
        var routeTenantId = Guid.NewGuid();
        var idRoute = Guid.NewGuid();
        var queryTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();

        var routeValues = new RouteValueDictionary
        {
            { "tenantId", routeTenantId.ToString() },
            { "id", idRoute.ToString() }
        };

        var query = new Dictionary<string, string> { { "tenantId", queryTenantId.ToString() } };
        var headers = new Dictionary<string, string> { { "X-Tenant-Id", headerTenantId.ToString() } };

        var context = CreateHttpContext(routeValues, "/api/v2/tenants/" + idRoute + "/members", query, headers);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(routeTenantId, "route parameter {tenantId} takes highest precedence");
    }

    [Fact]
    public void TenantId_ShouldPrioritizeIdRouteParameter_WhenPathContainsTenantsAndTenantIdIsAbsent()
    {
        // Arrange
        var idRoute = Guid.NewGuid();
        var queryTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();

        var routeValues = new RouteValueDictionary
        {
            { "id", idRoute.ToString() }
        };

        var query = new Dictionary<string, string> { { "tenantId", queryTenantId.ToString() } };
        var headers = new Dictionary<string, string> { { "X-Tenant-Id", headerTenantId.ToString() } };

        var context = CreateHttpContext(routeValues, "/api/v2/tenants/" + idRoute, query, headers);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(idRoute, "{id} in /tenants/ routes takes precedence over query params and headers");
    }

    [Fact]
    public void TenantId_ShouldPrioritizeQueryParameter_WhenNoRouteValuesPresent()
    {
        // Arrange
        var queryTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();

        var query = new Dictionary<string, string> { { "tenantId", queryTenantId.ToString() } };
        var headers = new Dictionary<string, string> { { "X-Tenant-Id", headerTenantId.ToString() } };

        var context = CreateHttpContext(null, "/api/v2/field-offices", query, headers);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(queryTenantId, "query parameter ?tenantId= takes precedence over request headers");
    }

    [Fact]
    public void TenantId_ShouldSupportSnakeCaseQueryParameter()
    {
        // Arrange
        var queryTenantId = Guid.NewGuid();
        var query = new Dictionary<string, string> { { "tenant_id", queryTenantId.ToString() } };

        var context = CreateHttpContext(null, "/api/v2/roles", query);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(queryTenantId, "query parameter ?tenant_id= is properly recognized");
    }

    [Fact]
    public void TenantId_ShouldResolveFromHeader_WhenNoRouteOrQueryPresent()
    {
        // Arrange
        var headerTenantId = Guid.NewGuid();
        var headers = new Dictionary<string, string> { { "X-Tenant-Id", headerTenantId.ToString() } };

        var context = CreateHttpContext(null, "/api/v2/applications", null, headers);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(headerTenantId, "header X-Tenant-Id is parsed when route and query are absent");
    }

    [Fact]
    public void TenantId_ShouldIgnoreInvalidGuidStringsGracefully()
    {
        // Arrange
        var validHeaderTenantId = Guid.NewGuid();
        var routeValues = new RouteValueDictionary { { "tenantId", "not-a-valid-guid" } };
        var query = new Dictionary<string, string> { { "tenantId", "also-invalid" } };
        var headers = new Dictionary<string, string> { { "X-Tenant-Id", validHeaderTenantId.ToString() } };

        var context = CreateHttpContext(routeValues, "/api/v2/services", query, headers);
        _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(context);
        var service = new TenantContextService(_httpContextAccessorMock.Object, _currentUserServiceMock.Object, _dbContext);

        // Act
        var result = service.TenantId;

        // Assert
        result.Should().Be(validHeaderTenantId, "invalid GUIDs in higher-precedence sources are skipped in favor of valid sources");
    }
}
