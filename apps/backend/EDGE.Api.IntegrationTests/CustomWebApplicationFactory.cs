using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Moq;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Infrastructure.Options;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Services;

namespace EDGE.Api.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public InMemoryTestStorageService TestStorage { get; } = new();
    public Guid TestTenantId { get; } = Guid.NewGuid();
    public string TestUserId { get; } = "test_user_123";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var testMasterKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=test_db;Username=postgres;Password=postgres",
                ["Hangfire:UseInMemory"] = "true",
                ["StorageEncryption:MasterEncryptionKey"] = testMasterKey,
                ["CloudflareR2:AccountId"] = "test-account-id",
                ["CloudflareR2:AccessKeyId"] = "test-access-key-id",
                ["CloudflareR2:SecretAccessKey"] = "test-secret-access-key",
                ["CloudflareR2:BucketName"] = "test-bucket"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Remove background hosted services (e.g. DatabaseInitializerHostedService, Hangfire server) during integration tests
            var hostedServices = services.Where(d => d.ServiceType == typeof(IHostedService)).ToList();
            foreach (var service in hostedServices)
            {
                services.Remove(service);
            }

            // Remove all DbContextOptions descriptors to replace Npgsql with InMemory provider cleanly
            var dbContextDescriptors = services.Where(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                     d.ServiceType == typeof(DbContextOptions) ||
                     d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true).ToList();

            foreach (var descriptor in dbContextDescriptors)
            {
                services.Remove(descriptor);
            }

            var dbName = "IntegrationTestDb_" + Guid.NewGuid();
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(dbName);
            });

            // Replace IStorageService with In-Memory Test Storage Service
            var storageDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IStorageService));
            if (storageDescriptor != null)
            {
                services.Remove(storageDescriptor);
            }
            services.AddSingleton<IStorageService>(TestStorage);

            // Replace ICurrentUserService with Mock
            var currentUserServiceDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ICurrentUserService));
            if (currentUserServiceDescriptor != null)
            {
                services.Remove(currentUserServiceDescriptor);
            }
            var mockUserService = new Mock<ICurrentUserService>();
            mockUserService.Setup(u => u.UserId).Returns(TestUserId);
            mockUserService.Setup(u => u.Email).Returns("testuser@ntc.gov.ph");
            mockUserService.Setup(u => u.IsEmailVerified).Returns(true);
            mockUserService.Setup(u => u.TenantId).Returns(TestTenantId);
            services.AddSingleton<ICurrentUserService>(mockUserService.Object);

            // Add Test Authorization Handler for Integration Testing
            services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, TestAllowAllAuthorizationHandler>();

            // Seed Test Region, Tenant, User, Role, and Active TenantMember
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var region = new Region
            {
                Id = Guid.NewGuid(),
                Code = "R10",
                Name = "Region 10",
                IsActive = true
            };
            var tenant = new Tenant
            {
                Id = TestTenantId,
                Code = "TNT-R10",
                Name = "NTC Region 10 Office",
                IsActive = true,
                RegionId = region.Id
            };
            var user = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = TestUserId,
                Email = "testuser@ntc.gov.ph",
                FirstName = "IntegrationTest",
                LastName = "User"
            };
            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Key = "admin"
            };
            var tenantMember = new TenantMember
            {
                Id = Guid.NewGuid(),
                TenantId = TestTenantId,
                UserId = user.Id,
                RoleId = role.Id,
                Division = "IT",
                Position = "System Admin"
            };

            db.Regions.Add(region);
            db.Tenants.Add(tenant);
            db.Users.Add(user);
            db.Roles.Add(role);
            db.TenantMembers.Add(tenantMember);
            db.SaveChanges();
        });
    }
}

public class InMemoryTestStorageService : IStorageService
{
    public ConcurrentDictionary<string, byte[]> Storage { get; } = new();

    public async Task<string> UploadFileAsync(string storageKey, Stream contentStream, string contentType, CancellationToken cancellationToken = default)
    {
        using var ms = new MemoryStream();
        await contentStream.CopyToAsync(ms, cancellationToken);
        Storage[storageKey] = ms.ToArray();
        return storageKey;
    }

    public Task<Stream> DownloadFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        if (!Storage.TryGetValue(storageKey, out var bytes))
        {
            throw new FileNotFoundException($"Storage key '{storageKey}' not found.");
        }
        return Task.FromResult<Stream>(new MemoryStream(bytes));
    }

    public Task DeleteFileAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        Storage.TryRemove(storageKey, out _);
        return Task.CompletedTask;
    }
}

public class TestAllowAllAuthorizationHandler : Microsoft.AspNetCore.Authorization.IAuthorizationHandler
{
    public Task HandleAsync(Microsoft.AspNetCore.Authorization.AuthorizationHandlerContext context)
    {
        foreach (var requirement in context.PendingRequirements.ToList())
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}
