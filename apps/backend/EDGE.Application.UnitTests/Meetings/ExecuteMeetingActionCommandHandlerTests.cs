using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.ExecuteMeetingAction;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class ExecuteMeetingActionCommandHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IMeetingNotificationService> _meetingNotificationServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly ExecuteMeetingActionCommandHandler _handler;

    public ExecuteMeetingActionCommandHandlerTests()
    {
        _handler = new ExecuteMeetingActionCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _meetingNotificationServiceMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotAuthenticated()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var command = new ExecuteMeetingActionCommand("edg-123", MeetingActionType.RaiseHand);
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldThrowKeyNotFoundException_WhenMeetingNotFound()
    {
        var currentUser = new User { Id = Guid.NewGuid() };
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-missing", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Meeting?)null);

        var command = new ExecuteMeetingActionCommand("edg-missing", MeetingActionType.RaiseHand);
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldRaiseHandAndSetQueuePosition()
    {
        var currentUserId = Guid.NewGuid();
        var meetingId = Guid.NewGuid();
        var currentUser = new User { Id = currentUserId };
        var participant = new MeetingParticipant { MeetingId = meetingId, UserId = currentUserId, Role = ParticipantRole.Member };
        var meeting = new Meeting
        {
            Id = meetingId,
            MeetingCode = "edg-test",
            Participants = new List<MeetingParticipant> { participant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-test", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        _meetingRepositoryMock
            .Setup(r => r.GetHandRaiseQueueCountAsync(meetingId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        var command = new ExecuteMeetingActionCommand("edg-test", MeetingActionType.RaiseHand);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        participant.IsHandRaised.Should().BeTrue();
        participant.HandRaiseQueuePosition.Should().Be(3);
        _meetingRepositoryMock.Verify(r => r.AddMeetingActionAsync(It.IsAny<MeetingAction>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldEndMeeting_WhenCallerIsHost()
    {
        var hostUserId = Guid.NewGuid();
        var meetingId = Guid.NewGuid();
        var hostUser = new User { Id = hostUserId };
        var participant = new MeetingParticipant { MeetingId = meetingId, UserId = hostUserId, Role = ParticipantRole.Owner };
        var meeting = new Meeting
        {
            Id = meetingId,
            MeetingCode = "edg-test",
            HostUserId = hostUserId,
            Status = MeetingStatus.Live,
            Participants = new List<MeetingParticipant> { participant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hostUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-test", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        var command = new ExecuteMeetingActionCommand("edg-test", MeetingActionType.EndMeeting);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        meeting.Status.Should().Be(MeetingStatus.Ended);
        _meetingNotificationServiceMock.Verify(n => n.NotifyMeetingEndedAsync("edg-test", It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldCancelMeeting_WhenCallerIsHost()
    {
        var hostUserId = Guid.NewGuid();
        var meetingId = Guid.NewGuid();
        var hostUser = new User { Id = hostUserId };
        var participant = new MeetingParticipant { MeetingId = meetingId, UserId = hostUserId, Role = ParticipantRole.Owner };
        var meeting = new Meeting
        {
            Id = meetingId,
            MeetingCode = "edg-cancel",
            HostUserId = hostUserId,
            Status = MeetingStatus.Scheduled,
            Participants = new List<MeetingParticipant> { participant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hostUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-cancel", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        var command = new ExecuteMeetingActionCommand("edg-cancel", MeetingActionType.CancelMeeting);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        meeting.Status.Should().Be(MeetingStatus.Cancelled);
        _meetingNotificationServiceMock.Verify(n => n.NotifyMeetingEndedAsync("edg-cancel", It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldLeaveMeeting_AndReassignHostDuties_WhenHostLeaves()
    {
        var hostUserId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var meetingId = Guid.NewGuid();
        var hostUser = new User { Id = hostUserId };
        var hostParticipant = new MeetingParticipant { MeetingId = meetingId, UserId = hostUserId, Role = ParticipantRole.Owner };
        var otherParticipant = new MeetingParticipant { MeetingId = meetingId, UserId = otherUserId, Role = ParticipantRole.Member };
        var meeting = new Meeting
        {
            Id = meetingId,
            MeetingCode = "edg-leave",
            HostUserId = hostUserId,
            Status = MeetingStatus.Live,
            Participants = new List<MeetingParticipant> { hostParticipant, otherParticipant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hostUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-leave", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        var command = new ExecuteMeetingActionCommand("edg-leave", MeetingActionType.LeaveMeeting);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        hostParticipant.LeftAt.Should().NotBeNull();
        otherParticipant.Role.Should().Be(ParticipantRole.Admin);
        meeting.HostUserId.Should().Be(hostUserId); // Permanent ownership preserved
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
