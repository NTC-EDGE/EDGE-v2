using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.ToggleArchiveConversation;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Conversations;

public class ToggleArchiveConversationCommandHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly ToggleArchiveConversationCommandHandler _handler;

    public ToggleArchiveConversationCommandHandlerTests()
    {
        _handler = new ToggleArchiveConversationCommandHandler(
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

        var command = new ToggleArchiveConversationCommand(Guid.NewGuid());
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowKeyNotFoundException_WhenConversationNotFound()
    {
        var currentUser = new User { Id = Guid.NewGuid(), FirstName = "John", LastName = "Doe" };
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Conversation?)null);

        var command = new ToggleArchiveConversationCommand(Guid.NewGuid());
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldToggleArchiveStatus_WhenValidParticipant()
    {
        var currentUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();
        var currentUser = new User { Id = currentUserId, FirstName = "Jane", LastName = "Doe" };

        var conversation = new Conversation
        {
            Id = convId,
            IsArchived = false,
            Participants = new List<ConversationParticipant>
            {
                new() { UserId = currentUserId, HasLeft = false }
            }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        var command = new ToggleArchiveConversationCommand(convId, true);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        conversation.IsArchived.Should().BeTrue();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
