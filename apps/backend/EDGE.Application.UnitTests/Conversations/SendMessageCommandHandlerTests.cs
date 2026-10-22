using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.SendMessage;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class SendMessageCommandHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IChatNotificationService> _chatNotificationServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly SendMessageCommandHandler _handler;

    public SendMessageCommandHandlerTests()
    {
        _handler = new SendMessageCommandHandler(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _chatNotificationServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotAuthenticated()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new SendMessageCommand(Guid.NewGuid(), "Hello");
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

        var command = new SendMessageCommand(Guid.NewGuid(), "Hello");
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotActiveParticipant()
    {
        var currentUser = new User { Id = Guid.NewGuid() };
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            Participants = new List<ConversationParticipant>()
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(conversation.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        var command = new SendMessageCommand(conversation.Id, "Hello");
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldSendMessage_AndNotifyParticipants()
    {
        var currentUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var currentUser = new User
        {
            Id = currentUserId,
            FirstName = "Alice",
            LastName = "Smith",
            ProfilePicture = "https://avatar.com/alice.png"
        };

        var conversation = new Conversation
        {
            Id = convId,
            Participants = new List<ConversationParticipant>
            {
                new() { ConversationId = convId, UserId = currentUserId, TenantId = tenantId, HasLeft = false },
                new() { ConversationId = convId, UserId = otherUserId, TenantId = tenantId, HasLeft = false }
            }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conversation);

        var command = new SendMessageCommand(convId, "Testing realtime chat!");
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Content.Should().Be("Testing realtime chat!");
        result.SenderName.Should().Be("Alice Smith");
        conversation.LastMessagePreview.Should().Be("Testing realtime chat!");

        _conversationRepositoryMock.Verify(r => r.AddMessageAsync(It.IsAny<ChatMessage>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _chatNotificationServiceMock.Verify(s => s.NotifyMessageSentAsync(It.IsAny<EDGE.Application.Conversations.DTOs.ChatMessageDto>(), It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
