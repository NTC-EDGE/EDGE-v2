using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;
using EDGE.Infrastructure.Persistence;
using EDGE.Infrastructure.Persistence.Repositories;
using Xunit;

namespace EDGE.Api.IntegrationTests;

public class UserAutoLinkConcurrencyTests
{
    private static DbContextOptions<ApplicationDbContext> CreateInMemoryDbOptions()
    {
        return new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"AutoLinkConcurrencyDb_{Guid.NewGuid()}")
            .Options;
    }

    [Fact]
    public async Task Concurrent_AutoLinking_SameUser_SimultaneousRequests_ShouldAllSucceedWithoutExceptions()
    {
        // 1. Arrange - Seed an eligible unlinked / seed account in database
        var dbOptions = CreateInMemoryDbOptions();
        var seedUserId = Guid.NewGuid();
        var targetEmail = "evaluator.concurrent@ntcedge.com";
        var initialSeedAuthId = "user_evaluator123";
        var liveClerkAuthId = "user_2t47xEvaluatorLiveClerk";

        using (var seedContext = new ApplicationDbContext(dbOptions))
        {
            var seedUser = new User
            {
                Id = seedUserId,
                AuthUserId = initialSeedAuthId,
                Email = targetEmail,
                FirstName = "Concurrent",
                LastName = "Evaluator",
                AccountType = ApplicantType.Individual
            };
            seedContext.Users.Add(seedUser);
            await seedContext.SaveChangesAsync();
        }

        // 2. Act - Run 15 concurrent requests resolving the current user with verified email
        const int concurrentRequestCount = 15;
        var tasks = Enumerable.Range(0, concurrentRequestCount).Select(async i =>
        {
            using var context = new ApplicationDbContext(dbOptions);
            var repo = new UserRepository(context);

            var mockCurrentUserService = new Mock<ICurrentUserService>();
            mockCurrentUserService.Setup(u => u.UserId).Returns(liveClerkAuthId);
            mockCurrentUserService.Setup(u => u.Email).Returns(targetEmail);
            mockCurrentUserService.Setup(u => u.IsEmailVerified).Returns(true);

            return await repo.ResolveCurrentUserAsync(mockCurrentUserService.Object);
        });

        var results = await Task.WhenAll(tasks);

        // 3. Assert - All concurrent operations should complete successfully without unhandled exceptions
        results.Should().NotBeNull();
        results.Should().HaveCount(concurrentRequestCount);
        results.Should().AllSatisfy(user =>
        {
            user.Should().NotBeNull();
            user!.Email.Should().Be(targetEmail);
            user.AuthUserId.Should().Be(liveClerkAuthId);
        });

        // Verify final state in database
        using (var verifyContext = new ApplicationDbContext(dbOptions))
        {
            var usersWithEmail = await verifyContext.Users.Where(u => u.Email == targetEmail).ToListAsync();
            usersWithEmail.Should().HaveCount(1, because: "Unique constraint on Email must be preserved");
            usersWithEmail[0].AuthUserId.Should().Be(liveClerkAuthId);
        }
    }

    [Fact]
    public async Task Concurrent_AutoLinking_CollisionAttempt_ShouldSafelyBlockAttackerWithoutExceptions()
    {
        // 1. Arrange - Seed an account
        var dbOptions = CreateInMemoryDbOptions();
        var targetEmail = "chief.eod@ntcedge.com";
        var legitimateAuthId = "user_clerk_legitimate_chief";
        var attackerAuthId = "user_attacker_attempting_hijack";

        using (var seedContext = new ApplicationDbContext(dbOptions))
        {
            var seedUser = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = "user_chiefeod123", // Seed placeholder ID
                Email = targetEmail,
                FirstName = "Roberto",
                LastName = "Chief",
                AccountType = ApplicantType.Individual
            };
            seedContext.Users.Add(seedUser);
            await seedContext.SaveChangesAsync();
        }

        // 2. Act - First link the legitimate external ID
        using (var legitContext = new ApplicationDbContext(dbOptions))
        {
            var repo = new UserRepository(legitContext);
            var mockLegitUserService = new Mock<ICurrentUserService>();
            mockLegitUserService.Setup(u => u.UserId).Returns(legitimateAuthId);
            mockLegitUserService.Setup(u => u.Email).Returns(targetEmail);
            mockLegitUserService.Setup(u => u.IsEmailVerified).Returns(true);

            var legitResult = await repo.ResolveCurrentUserAsync(mockLegitUserService.Object);
            legitResult.Should().NotBeNull();
            legitResult!.AuthUserId.Should().Be(legitimateAuthId);
        }

        // 3. Act - Concurrent attacker requests attempting to claim the same verified email
        const int attackerRequestCount = 10;
        var attackerTasks = Enumerable.Range(0, attackerRequestCount).Select(async i =>
        {
            using var context = new ApplicationDbContext(dbOptions);
            var repo = new UserRepository(context);

            var mockAttackerService = new Mock<ICurrentUserService>();
            mockAttackerService.Setup(u => u.UserId).Returns($"{attackerAuthId}_{i}");
            mockAttackerService.Setup(u => u.Email).Returns(targetEmail);
            mockAttackerService.Setup(u => u.IsEmailVerified).Returns(true);

            return await repo.ResolveCurrentUserAsync(mockAttackerService.Object);
        });

        var attackerResults = await Task.WhenAll(attackerTasks);

        // 4. Assert - All attacker attempts should be blocked (return null) without throwing unhandled exceptions
        attackerResults.Should().AllSatisfy(result => result.Should().BeNull());

        // Verify account remained bound to the legitimate ID
        using (var verifyContext = new ApplicationDbContext(dbOptions))
        {
            var finalUser = await verifyContext.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
            finalUser.Should().NotBeNull();
            finalUser!.AuthUserId.Should().Be(legitimateAuthId);
        }
    }

    [Fact]
    public async Task Concurrent_AutoLinking_UnverifiedEmail_ShouldNotAutoLink()
    {
        // 1. Arrange - Seed placeholder account
        var dbOptions = CreateInMemoryDbOptions();
        var targetEmail = "unverified.user@ntcedge.com";
        var unverifiedAuthId = "user_clerk_unverified_123";

        using (var seedContext = new ApplicationDbContext(dbOptions))
        {
            var seedUser = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = "seed_unverified_placeholder",
                Email = targetEmail,
                FirstName = "Unverified",
                LastName = "User",
                AccountType = ApplicantType.Individual
            };
            seedContext.Users.Add(seedUser);
            await seedContext.SaveChangesAsync();
        }

        // 2. Act - Attempt resolution with IsEmailVerified = false
        using (var context = new ApplicationDbContext(dbOptions))
        {
            var repo = new UserRepository(context);
            var mockUserService = new Mock<ICurrentUserService>();
            mockUserService.Setup(u => u.UserId).Returns(unverifiedAuthId);
            mockUserService.Setup(u => u.Email).Returns(targetEmail);
            mockUserService.Setup(u => u.IsEmailVerified).Returns(false);

            var result = await repo.ResolveCurrentUserAsync(mockUserService.Object);

            // 3. Assert - Unverified email should not auto-link
            result.Should().BeNull();
        }

        using (var verifyContext = new ApplicationDbContext(dbOptions))
        {
            var userInDb = await verifyContext.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
            userInDb.Should().NotBeNull();
            userInDb!.AuthUserId.Should().Be("seed_unverified_placeholder");
        }
    }

    [Fact]
    public async Task AutoLinking_WithMixedCaseEmail_MatchesAndLinksCaseInsensitively()
    {
        // 1. Arrange - Seed account with lowercase email
        var dbOptions = CreateInMemoryDbOptions();
        var targetEmail = "evaluator.mixedcase@ntcedge.com";
        var liveAuthId = "user_clerk_mixed_case_123";

        using (var seedContext = new ApplicationDbContext(dbOptions))
        {
            var seedUser = new User
            {
                Id = Guid.NewGuid(),
                AuthUserId = "user_evaluator123",
                Email = targetEmail,
                FirstName = "Case",
                LastName = "Test",
                AccountType = ApplicantType.Individual
            };
            seedContext.Users.Add(seedUser);
            await seedContext.SaveChangesAsync();
        }

        // 2. Act - Resolve with Uppercase/Mixed-case email from incoming authentication provider
        using (var context = new ApplicationDbContext(dbOptions))
        {
            var repo = new UserRepository(context);
            var mockUserService = new Mock<ICurrentUserService>();
            mockUserService.Setup(u => u.UserId).Returns(liveAuthId);
            mockUserService.Setup(u => u.Email).Returns("Evaluator.MixedCase@NTCEdge.com");
            mockUserService.Setup(u => u.IsEmailVerified).Returns(true);

            var result = await repo.ResolveCurrentUserAsync(mockUserService.Object);

            // 3. Assert - Resolves and links successfully
            result.Should().NotBeNull();
            result!.AuthUserId.Should().Be(liveAuthId);
            result.Email.Should().Be(targetEmail);
        }

        // Verify database persistence
        using (var verifyContext = new ApplicationDbContext(dbOptions))
        {
            var userInDb = await verifyContext.Users.FirstOrDefaultAsync(u => u.Email == targetEmail);
            userInDb.Should().NotBeNull();
            userInDb!.AuthUserId.Should().Be(liveAuthId);
        }
    }
}
