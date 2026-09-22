using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Conversations.Commands.AddParticipants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Conversations;

public class AddConversationParticipantsCommandHandlerTests
{
    private readonly Mock<IConversationRepository> _conversationRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly AddConversationParticipantsCommandHandler _handler;

    public AddConversationParticipantsCommandHandlerTests()
    {
        _handler = new AddConversationParticipantsCommandHandler(
            _conversationRepositoryMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCallerNotActiveMemberAndNotSuperAdmin()
    {
        var currentUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();
        var currentUser = new User { Id = currentUserId, IsSuperAdmin = false };
        var conv = new Conversation { Id = convId };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conv);

        var command = new AddConversationParticipantsCommand(convId, new List<Guid> { Guid.NewGuid() });
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldAddParticipantsAndReactivateDeletedParticipants()
    {
        var currentUserId = Guid.NewGuid();
        var newUserId = Guid.NewGuid();
        var reactivatedUserId = Guid.NewGuid();
        var convId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var currentUser = new User { Id = currentUserId, IsSuperAdmin = false };
        var newUser = new User { Id = newUserId, FirstName = "New", LastName = "User" };
        var reactivatedUser = new User { Id = reactivatedUserId, FirstName = "Reactivated", LastName = "User" };
        var tenant = new Tenant { Id = tenantId, Name = "Region VI", IsActive = true };

        var conv = new Conversation
        {
            Id = convId,
            TenantId = tenantId,
            Participants = new List<ConversationParticipant>
            {
                new() { ConversationId = convId, UserId = currentUserId, Role = ParticipantRole.Owner, HasLeft = false }
            }
        };

        var allParticipants = new List<ConversationParticipant>
        {
            new() { ConversationId = convId, UserId = currentUserId, Role = ParticipantRole.Owner, HasLeft = false },
            new() { ConversationId = convId, UserId = reactivatedUserId, Role = ParticipantRole.Member, HasLeft = true, IsDeleted = true }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _conversationRepositoryMock
            .Setup(r => r.GetByIdAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(conv);

        _conversationRepositoryMock
            .Setup(r => r.GetAllParticipantsAsync(convId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(allParticipants);

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(newUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(newUser);

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(reactivatedUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reactivatedUser);

        _tenantRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant> { tenant });

        _tenantMemberRepositoryMock
            .Setup(r => r.GetMembersByUserAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>());

        var command = new AddConversationParticipantsCommand(convId, new List<Guid> { newUserId, reactivatedUserId });
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        conv.Participants.Should().Contain(p => p.UserId == newUserId && !p.IsDeleted);
        var reactivated = allParticipants.First(p => p.UserId == reactivatedUserId);
        reactivated.HasLeft.Should().BeFalse();
        reactivated.IsDeleted.Should().BeFalse();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
