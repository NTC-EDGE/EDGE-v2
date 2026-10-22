using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.CreateConversation;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class CreateConversationCommandHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IChatNotificationService> _chatNotificationServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly CreateConversationCommandHandler _handler;

    public CreateConversationCommandHandlerTests()
    {
        _handler = new CreateConversationCommandHandler(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _tenantRepositoryMock.Object,
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

        var command = new CreateConversationCommand(
            Title: "General",
            Description: null,
            Type: ConversationType.Group,
            Scope: ConversationScope.IntraRegional,
            TenantId: null,
            ParticipantUserIds: new List<Guid>());

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldCreateConversationAndAddParticipants()
    {
        var currentUserId = Guid.NewGuid();
        var peerUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var currentUser = new User { Id = currentUserId, FirstName = "Owner", LastName = "User" };
        var peerUser = new User { Id = peerUserId, FirstName = "Peer", LastName = "User" };
        var tenant = new Tenant { Id = tenantId, Name = "Region III", IsActive = true };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(peerUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(peerUser);

        _tenantRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant> { tenant });

        _tenantMemberRepositoryMock
            .Setup(r => r.GetMembersByUserAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>());

        Conversation? savedConv = null;
        _conversationRepositoryMock
            .Setup(r => r.AddConversationAsync(It.IsAny<Conversation>(), It.IsAny<CancellationToken>()))
            .Callback<Conversation, CancellationToken>((c, _) => savedConv = c)
            .ReturnsAsync((Conversation c, CancellationToken _) => c);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => savedConv);

        var command = new CreateConversationCommand(
            Title: "Taskforce Group",
            Description: "Internal group",
            Type: ConversationType.Group,
            Scope: ConversationScope.IntraRegional,
            TenantId: null,
            ParticipantUserIds: new List<Guid> { peerUserId });

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Title.Should().Be("Taskforce Group");
        savedConv.Should().NotBeNull();
        savedConv!.Participants.Should().HaveCount(2);
        savedConv.Participants.Should().Contain(p => p.UserId == currentUserId && p.Role == ParticipantRole.Owner);
        savedConv.Participants.Should().Contain(p => p.UserId == peerUserId && p.Role == ParticipantRole.Member);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
