using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Queries.GetMeetings;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class GetMeetingsQueryHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();

    private readonly GetMeetingsQueryHandler _handler;

    public GetMeetingsQueryHandlerTests()
    {
        _handler = new GetMeetingsQueryHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _currentUserServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldThrowUnauthorizedAccessException_WhenUserNotAuthenticated()
    {
        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var query = new GetMeetingsQuery(null, "active");
        var act = async () => await _handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldReturnFilteredMeetings_WhenAuthenticated()
    {
        var currentUserId = Guid.NewGuid();
        var currentUser = new User { Id = currentUserId, FirstName = "Host", LastName = "User" };

        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            Title = "Regional Sync",
            MeetingCode = "edg-test",
            Scope = ConversationScope.IntraRegional,
            HostUserId = currentUserId,
            HostUser = currentUser,
            ScheduledStartTime = DateTimeOffset.UtcNow.AddHours(1),
            Status = MeetingStatus.Scheduled,
            Participants = new List<MeetingParticipant>
            {
                new() { UserId = currentUserId, User = currentUser, Role = ParticipantRole.Owner }
            }
        };

        _userRepositoryMock
            .Setup(r => r.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(currentUser);

        _meetingRepositoryMock
            .Setup(r => r.GetMeetingsAsync(currentUserId, null, "active", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Meeting> { meeting });

        var query = new GetMeetingsQuery(null, "active");
        var result = await _handler.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].MeetingCode.Should().Be("edg-test");
        result[0].Title.Should().Be("Regional Sync");
        result[0].Status.Should().Be(MeetingStatus.Scheduled);
    }
}
