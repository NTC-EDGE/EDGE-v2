using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Users.Commands.ChangeUserEmail;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Users;

public class AdminChangeUserEmailCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IClerkUserService> _clerkUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly Mock<ILogger<AdminChangeUserEmailCommandHandler>> _loggerMock = new();

    private readonly AdminChangeUserEmailCommandHandler _handler;

    public AdminChangeUserEmailCommandHandlerTests()
    {
        _handler = new AdminChangeUserEmailCommandHandler(
            _userRepositoryMock.Object,
            _clerkUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnNull_WhenUserDoesNotExist()
    {
        var userId = Guid.NewGuid();
        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new AdminChangeUserEmailCommand(userId, "new@test.com");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenEmailAlreadyExistsInLocalDb()
    {
        var userId = Guid.NewGuid();
        var existingUser = new User { Id = userId, Email = "old@test.com", AuthUserId = "user_123" };
        var duplicateUser = new User { Id = Guid.NewGuid(), Email = "taken@test.com" };

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync("taken@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(duplicateUser);

        var command = new AdminChangeUserEmailCommand(userId, "taken@test.com");

        var act = () => _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenEmailAlreadyExistsInClerk()
    {
        var userId = Guid.NewGuid();
        var existingUser = new User { Id = userId, Email = "old@test.com", AuthUserId = "user_123" };

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync("clerk_taken@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _clerkUserServiceMock
            .Setup(c => c.GetUsersByEmailAsync("clerk_taken@test.com"))
            .ReturnsAsync(new List<ClerkUserResponse> { new() { Id = "user_other_999" } });

        var command = new AdminChangeUserEmailCommand(userId, "clerk_taken@test.com");

        var act = () => _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists in Clerk*");
    }

    [Fact]
    public async Task Handle_ShouldUpdateEmailInClerkAndLocalDb_WhenValid()
    {
        var userId = Guid.NewGuid();
        var existingUser = new User
        {
            Id = userId,
            FirstName = "Juan",
            LastName = "Dela Cruz",
            Email = "old@test.com",
            AuthUserId = "user_ntc_123"
        };

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync("newemail@test.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _clerkUserServiceMock
            .Setup(c => c.GetUsersByEmailAsync("newemail@test.com"))
            .ReturnsAsync(new List<ClerkUserResponse>());

        var command = new AdminChangeUserEmailCommand(userId, "newemail@test.com");

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Email.Should().Be("newemail@test.com");

        _clerkUserServiceMock.Verify(c => c.UpdateUserPrimaryEmailAsync("user_ntc_123", "newemail@test.com"), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
