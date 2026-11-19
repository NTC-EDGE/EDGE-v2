using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.CloseMeetingPoll;
using EDGE.Application.Meetings.Commands.CreateMeetingPoll;
using EDGE.Application.Meetings.Commands.UpdateMeeting;
using EDGE.Application.Meetings.Commands.VoteMeetingPoll;
using EDGE.Application.Meetings.DTOs;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class MeetingPollAndUpdateCommandHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IMeetingNotificationService> _notificationMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    [Fact]
    public async Task CreatePoll_ShouldBroadcastNotification_AndReturnSanitizedOptions()
    {
        var hostId = Guid.NewGuid();
        var host = new User { Id = hostId, FirstName = "Maria", LastName = "Santos" };
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            MeetingCode = "edg-poll1",
            HostUserId = hostId,
            Status = MeetingStatus.Live,
            Participants = new List<MeetingParticipant>
            {
                new() { UserId = hostId, Role = ParticipantRole.Owner }
            }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(host);
        _meetingRepositoryMock
            .Setup(r => r.GetByCodeAsync("edg-poll1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);
        _meetingRepositoryMock
            .Setup(r => r.AddMeetingPollAsync(It.IsAny<MeetingPoll>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MeetingPoll p, CancellationToken _) => p);

        var handler = new CreateMeetingPollCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _notificationMock.Object);

        var result = await handler.Handle(
            new CreateMeetingPollCommand("edg-poll1", "Approve Q4 Plan?", new List<string> { "Yes", "No", "  " }, false),
            CancellationToken.None);

        result.Question.Should().Be("Approve Q4 Plan?");
        result.Options.Should().Equal("Yes", "No");
        _notificationMock.Verify(n => n.NotifyPollCreatedAsync("edg-poll1", It.IsAny<MeetingPollDto>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task VoteAndClosePoll_ShouldUpsertVote_AndClosePollCleanly()
    {
        var hostId = Guid.NewGuid();
        var voterId = Guid.NewGuid();
        var pollId = Guid.NewGuid();
        var meetingId = Guid.NewGuid();

        var voter = new User { Id = voterId, FirstName = "Juan", LastName = "Cruz" };
        var host = new User { Id = hostId, FirstName = "Host", LastName = "Admin" };
        var poll = new MeetingPoll
        {
            Id = pollId,
            MeetingId = meetingId,
            Question = "Preferred Slot?",
            OptionsJson = "[\"Morning\",\"Afternoon\"]",
            IsClosed = false,
            IsAnonymous = false,
            Votes = new List<MeetingPollVote>()
        };
        var meeting = new Meeting
        {
            Id = meetingId,
            MeetingCode = "edg-vote1",
            HostUserId = hostId,
            Status = MeetingStatus.Live,
            Participants = new List<MeetingParticipant>
            {
                new() { UserId = hostId, Role = ParticipantRole.Owner },
                new() { UserId = voterId, Role = ParticipantRole.Member }
            },
            Polls = new List<MeetingPoll> { poll }
        };

        _meetingRepositoryMock.Setup(r => r.GetByCodeAsync("edg-vote1", It.IsAny<CancellationToken>())).ReturnsAsync(meeting);
        _meetingRepositoryMock
            .Setup(r => r.AddMeetingPollVoteAsync(It.IsAny<MeetingPollVote>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((MeetingPollVote v, CancellationToken _) => v);

        // 1. Voter casts vote
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>())).ReturnsAsync(voter);
        var voteHandler = new VoteMeetingPollCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _notificationMock.Object);

        var voted = await voteHandler.Handle(new VoteMeetingPollCommand("edg-vote1", pollId, 1), CancellationToken.None);
        voted.Votes.Should().ContainSingle(v => v.UserId == voterId && v.SelectedOptionIndex == 1);
        _notificationMock.Verify(n => n.NotifyPollUpdatedAsync("edg-vote1", It.IsAny<MeetingPollDto>(), It.IsAny<CancellationToken>()), Times.Once);

        // 2. Host closes poll
        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>())).ReturnsAsync(host);
        var closeHandler = new CloseMeetingPollCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object,
            _notificationMock.Object);

        var closed = await closeHandler.Handle(new CloseMeetingPollCommand("edg-vote1", pollId), CancellationToken.None);
        closed.IsClosed.Should().BeTrue();
        _notificationMock.Verify(n => n.NotifyPollClosedAsync("edg-vote1", pollId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateMeeting_ShouldUpdateFields_WhenCallerIsHost()
    {
        var hostId = Guid.NewGuid();
        var host = new User { Id = hostId, FirstName = "Host", LastName = "User" };
        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            MeetingCode = "edg-upd1",
            Title = "Old Title",
            HostUserId = hostId,
            HostUser = host,
            Status = MeetingStatus.Scheduled,
            ScheduledStartTime = DateTimeOffset.UtcNow.AddDays(1),
            Participants = new List<MeetingParticipant> { new() { UserId = hostId, User = host, Role = ParticipantRole.Owner } }
        };

        _userRepositoryMock.Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>())).ReturnsAsync(host);
        _meetingRepositoryMock.Setup(r => r.GetByCodeAsync("edg-upd1", It.IsAny<CancellationToken>())).ReturnsAsync(meeting);

        var handler = new UpdateMeetingCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _unitOfWorkMock.Object);

        var nextStart = DateTimeOffset.UtcNow.AddDays(2);
        var updated = await handler.Handle(
            new UpdateMeetingCommand("edg-upd1", "Updated Regional Briefing", "New agenda", ConversationScope.InterRegional, nextStart, nextStart.AddHours(1)),
            CancellationToken.None);

        updated.Title.Should().Be("Updated Regional Briefing");
        updated.Scope.Should().Be(ConversationScope.InterRegional);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
