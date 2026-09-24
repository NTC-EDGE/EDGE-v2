using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.CreateMeeting;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class CreateMeetingCommandHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserNotificationRepository> _userNotificationRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly CreateMeetingCommandHandler _handler;

    public CreateMeetingCommandHandlerTests()
    {
        _handler = new CreateMeetingCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _userNotificationRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenCurrentUserNotResolved()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new CreateMeetingCommand(
            Title: "Test Meeting",
            Description: null,
            Scope: ConversationScope.IntraRegional,
            TenantId: null,
            ScheduledStartTime: DateTimeOffset.UtcNow,
            ScheduledEndTime: null);

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldCreateMeetingWithParticipants_AndFallbackTenantWhenNoMemberships()
    {
        var currentUserId = Guid.NewGuid();
        var inviteeId = Guid.NewGuid();
        var activeTenantId = Guid.NewGuid();

        var currentUser = new User { Id = currentUserId, FirstName = "Host", LastName = "User", Email = "host@test.com" };
        var inviteeUser = new User { Id = inviteeId, FirstName = "Guest", LastName = "User", Email = "guest@test.com" };

        var tenant = new Tenant { Id = activeTenantId, Name = "Region I", IsActive = true };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(inviteeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(inviteeUser);

        _tenantRepositoryMock
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant> { tenant });

        _tenantMemberRepositoryMock
            .Setup(r => r.GetMembersByUserAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>());

        Meeting? savedMeeting = null;
        _meetingRepositoryMock
            .Setup(r => r.AddMeetingAsync(It.IsAny<Meeting>(), It.IsAny<CancellationToken>()))
            .Callback<Meeting, CancellationToken>((m, _) => savedMeeting = m)
            .ReturnsAsync((Meeting m, CancellationToken _) => m);

        _meetingRepositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => savedMeeting);

        var command = new CreateMeetingCommand(
            Title: "Coordination Meeting",
            Description: "Discussion notes",
            Scope: ConversationScope.IntraRegional,
            TenantId: null,
            ScheduledStartTime: DateTimeOffset.UtcNow,
            ScheduledEndTime: DateTimeOffset.UtcNow.AddHours(1),
            ParticipantUserIds: new List<Guid> { inviteeId });

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Title.Should().Be("Coordination Meeting");
        savedMeeting.Should().NotBeNull();
        savedMeeting!.Participants.Should().HaveCount(2);
        savedMeeting.Participants.Should().Contain(p => p.UserId == currentUserId && p.Role == ParticipantRole.Owner);
        savedMeeting.Participants.Should().Contain(p => p.UserId == inviteeId && p.Role == ParticipantRole.Member);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
