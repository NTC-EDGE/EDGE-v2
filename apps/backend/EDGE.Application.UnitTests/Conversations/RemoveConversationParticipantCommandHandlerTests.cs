using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.RemoveParticipant;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class RemoveConversationParticipantCommandHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly RemoveConversationParticipantCommandHandler _handler;

    public RemoveConversationParticipantCommandHandlerTests()
    {
        _handler = new RemoveConversationParticipantCommandHandler(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotAuthenticated()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new RemoveConversationParticipantCommand(Guid.NewGuid(), Guid.NewGuid());
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowKeyNotFoundException_WhenConversationNotFound()
    {
        var currentUser = new User { Id = Guid.NewGuid() };
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Conversation?)null);

        var command = new RemoveConversationParticipantCommand(Guid.NewGuid(), Guid.NewGuid());
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldSetHasLeftTrue_WhenCallerIsAdminOrOwner()
    {
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();

        var adminUser = new User { Id = adminId };
        var adminParticipant = new ConversationParticipant { ConversationId = convId, UserId = adminId, Role = ParticipantRole.Owner, HasLeft = false };
        var targetParticipant = new ConversationParticipant { ConversationId = convId, UserId = targetUserId, Role = ParticipantRole.Member, HasLeft = false };

        var conversation = new Conversation
        {
            Id = convId,
            Participants = new List<ConversationParticipant> { adminParticipant, targetParticipant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        var command = new RemoveConversationParticipantCommand(convId, targetUserId);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        targetParticipant.HasLeft.Should().BeTrue();
        targetParticipant.LeftAt.Should().NotBeNull();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
