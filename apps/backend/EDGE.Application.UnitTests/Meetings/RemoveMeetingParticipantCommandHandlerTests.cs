using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.RemoveMeetingParticipant;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class RemoveMeetingParticipantCommandHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private readonly RemoveMeetingParticipantCommandHandler _handler;

    public RemoveMeetingParticipantCommandHandlerTests()
    {
        _handler = new RemoveMeetingParticipantCommandHandler(
            _meetingRepositoryMock.Object,
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

        var command = new RemoveMeetingParticipantCommand("edg-123", Guid.NewGuid());
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

        var command = new RemoveMeetingParticipantCommand("edg-missing", Guid.NewGuid());
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldRemoveParticipant_WhenCallerIsHost()
    {
        var hostId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var hostUser = new User { Id = hostId };
        var participant = new MeetingParticipant { UserId = targetUserId, Role = ParticipantRole.Member };
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            MeetingCode = "edg-test",
            HostUserId = hostId,
            Participants = new List<MeetingParticipant> { participant }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hostUser);

        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-test", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        var command = new RemoveMeetingParticipantCommand("edg-test", targetUserId);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().BeTrue();
        meeting.Participants.Should().NotContain(p => p.UserId == targetUserId);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
