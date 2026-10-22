using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Queries.GetConversations;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class GetConversationsQueryHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    private readonly GetConversationsQueryHandler _handler;

    public GetConversationsQueryHandlerTests()
    {
        _handler = new GetConversationsQueryHandler(
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

        var query = new GetConversationsQuery(null);
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldCalculateAccurateUnreadCount_AndResolveDirectChatTitles()
    {
        var currentUserId = Guid.NewGuid();
        var partnerId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var currentUser = new User { Id = currentUserId, FirstName = "Me", LastName = "User" };
        var partnerUser = new User { Id = partnerId, FirstName = "Bob", LastName = "Jones", ProfilePicture = "https://bob.jpg" };

        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            Type = ConversationType.Direct,
            Scope = ConversationScope.IntraRegional,
            TenantId = tenantId,
            Participants = new List<ConversationParticipant>
            {
                new() { UserId = currentUserId, User = currentUser, LastReadAt = DateTimeOffset.UtcNow.AddMinutes(-10) },
                new() { UserId = partnerId, User = partnerUser, LastReadAt = null }
            },
            Messages = new List<ChatMessage>
            {
                new() { Id = Guid.NewGuid(), SenderId = partnerId, CreatedAt = DateTime.UtcNow.AddMinutes(-5), IsDeleted = false },
                new() { Id = Guid.NewGuid(), SenderId = partnerId, CreatedAt = DateTime.UtcNow.AddMinutes(-2), IsDeleted = false },
                new() { Id = Guid.NewGuid(), SenderId = currentUserId, CreatedAt = DateTime.UtcNow.AddMinutes(-1), IsDeleted = false }
            }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetUserConversationsAsync(currentUserId, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Conversation> { conversation });

        var query = new GetConversationsQuery(null, null);
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Bob Jones");
        result[0].AvatarUrl.Should().Be("https://bob.jpg");
        result[0].UnreadCount.Should().Be(2);
        result[0].IsArchived.Should().BeFalse();
    }
}
