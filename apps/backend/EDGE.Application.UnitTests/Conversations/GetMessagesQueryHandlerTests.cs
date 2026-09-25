using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Queries.GetMessages;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class GetMessagesQueryHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    private readonly GetMessagesQueryHandler _handler;

    public GetMessagesQueryHandlerTests()
    {
        _handler = new GetMessagesQueryHandler(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotAuthenticated()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var query = new GetMessagesQuery(Guid.NewGuid());
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldReturnChatMessages_WhenUserIsActiveParticipant()
    {
        var currentUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();
        var currentUser = new User { Id = currentUserId };

        var conversation = new Conversation
        {
            Id = convId,
            Participants = new List<ConversationParticipant>
            {
                new() { ConversationId = convId, UserId = currentUserId, HasLeft = false }
            }
        };

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = convId,
            SenderId = currentUserId,
            Sender = currentUser,
            Content = "Hello unit test",
            Type = MessageType.Text
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        _conversationRepositoryMock
            .Setup(r => r.GetMessagesAsync(convId, 0, 50, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ChatMessage> { message });

        var query = new GetMessagesQuery(convId, 0, 50);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].Content.Should().Be("Hello unit test");
    }
}
