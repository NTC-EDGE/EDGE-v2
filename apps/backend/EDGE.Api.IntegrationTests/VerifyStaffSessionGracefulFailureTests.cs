using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using EDGE.Application.Auth.Commands.VerifyStaffSession;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Repositories;
using Xunit;

namespace EDGE.Api.IntegrationTests;

public class VerifyStaffSessionGracefulFailureTests
{
    private static DbContextOptions<ApplicationDbContext> CreateInMemoryDbOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"VerifyStaffSessionGracefulFailureDb_{Guid.NewGuid()}")
            .Options;
    }

    [Fact]
    public async Task Handler_WithMissingEmailClaim_FailsGracefullyWithoutExceptions()
    {
        // Arrange - Setup in-memory repositories
        var dbOptions = CreateInMemoryDbOptions();
        using var context = new ApplicationDbContext(dbOptions);

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(u => u.UserId).Returns("user_new_external_id_without_email");
        mockCurrentUserService.Setup(u => u.Email).Returns((string?)null);
        mockCurrentUserService.Setup(u => u.IsEmailVerified).Returns(false);

        var userRepo = new UserRepository(context);
        var tenantMemberRepo = new TenantMemberRepository(context);
        var tenantRepo = new TenantRepository(context);
        var geoRepo = new GeographicRepository(context);
        var roleRepo = new RoleRepository(context);
        var rolePermRepo = new RolePermissionRepository(context);
        var unitOfWork = new UnitOfWork(context);

        var handler = new VerifyStaffSessionCommandHandler(
            mockCurrentUserService.Object,
            userRepo,
            tenantMemberRepo,
            tenantRepo,
            geoRepo,
            roleRepo,
            rolePermRepo,
            unitOfWork
        );

        var command = new VerifyStaffSessionCommand("NCR");

        // Act
        var response = await handler.Handle(command, CancellationToken.None);

        // Assert - Fails gracefully with user-friendly error message, no unhandled exceptions
        response.Should().NotBeNull();
        response.Succeeded.Should().BeFalse();
        response.Message.Should().Contain("not yet registered");
    }

    [Fact]
    public async Task Handler_WithUnverifiedEmailClaim_FailsGracefullyWithoutAutoLinking()
    {
        // Arrange - Seed an existing placeholder account
        var dbOptions = CreateInMemoryDbOptions();
        var targetEmail = "staff.unverified@ntcedge.com";

        using (var seedContext = new ApplicationDbContext(dbOptions))
        {
            var seedUser = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = "user_evaluator123",
                Email = targetEmail,
                FirstName = "Jane",
                LastName = "Evaluator"
            };
            seedContext.Users.Add(seedUser);
            await seedContext.SaveChangesAsync();
        }

        using var context = new ApplicationDbContext(dbOptions);

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(u => u.UserId).Returns("user_new_external_unverified");
        mockCurrentUserService.Setup(u => u.Email).Returns(targetEmail);
        mockCurrentUserService.Setup(u => u.IsEmailVerified).Returns(false); // Unverified!

        var userRepo = new UserRepository(context);
        var tenantMemberRepo = new TenantMemberRepository(context);
        var tenantRepo = new TenantRepository(context);
        var geoRepo = new GeographicRepository(context);
        var roleRepo = new RoleRepository(context);
        var rolePermRepo = new RolePermissionRepository(context);
        var unitOfWork = new UnitOfWork(context);

        var handler = new VerifyStaffSessionCommandHandler(
            mockCurrentUserService.Object,
            userRepo,
            tenantMemberRepo,
            tenantRepo,
            geoRepo,
            roleRepo,
            rolePermRepo,
            unitOfWork
        );

        var command = new VerifyStaffSessionCommand("NCR");

        // Act
        var response = await handler.Handle(command, CancellationToken.None);

        // Assert - Fails gracefully, account is NOT auto-linked
        response.Should().NotBeNull();
        response.Succeeded.Should().BeFalse();
        response.Message.Should().Contain("not yet registered");

        using var verifyContext = new ApplicationDbContext(dbOptions);
        var userInDb = await verifyContext.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
        userInDb.Should().NotBeNull();
        userInDb!.AuthUserId.Should().Be("user_evaluator123", because: "Unverified email must not trigger auto-linking");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Handler_WithEmptyOrMissingUserId_FailsGracefullyWithAuthenticationRequired(string? emptyUserId)
    {
        // Arrange
        var dbOptions = CreateInMemoryDbOptions();
        using var context = new ApplicationDbContext(dbOptions);

        var mockCurrentUserService = new Mock<ICurrentUserService>();
        mockCurrentUserService.Setup(u => u.UserId).Returns(emptyUserId);
        mockCurrentUserService.Setup(u => u.Email).Returns("anyone@ntc.gov.ph");
        mockCurrentUserService.Setup(u => u.IsEmailVerified).Returns(true);

        var userRepo = new UserRepository(context);
        var tenantMemberRepo = new TenantMemberRepository(context);
        var tenantRepo = new TenantRepository(context);
        var geoRepo = new GeographicRepository(context);
        var roleRepo = new RoleRepository(context);
        var rolePermRepo = new RolePermissionRepository(context);
        var unitOfWork = new UnitOfWork(context);

        var handler = new VerifyStaffSessionCommandHandler(
            mockCurrentUserService.Object,
            userRepo,
            tenantMemberRepo,
            tenantRepo,
            geoRepo,
            roleRepo,
            rolePermRepo,
            unitOfWork
        );

        var command = new VerifyStaffSessionCommand("NCR");

        // Act
        var response = await handler.Handle(command, CancellationToken.None);

        // Assert
        response.Should().NotBeNull();
        response.Succeeded.Should().BeFalse();
        response.Message.Should().Contain("Authentication required");
    }
}
