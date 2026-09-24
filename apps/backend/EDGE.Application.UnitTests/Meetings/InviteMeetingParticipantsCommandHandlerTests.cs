using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Meetings.Commands.InviteMeetingParticipants;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Meetings;

public class InviteMeetingParticipantsCommandHandlerTests
{
    private readonly Mock<IMeetingRepository> _meetingRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserServiceMock = new();
    private readonly Mock<IUserNotificationRepository> _userNotificationRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly InviteMeetingParticipantsCommandHandler _handler;

    public InviteMeetingParticipantsCommandHandlerTests()
    {
        _handler = new InviteMeetingParticipantsCommandHandler(
            _meetingRepositoryMock.Object,
            _userRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _currentUserServiceMock.Object,
            _userNotificationRepositoryMock.Object,
            _unitOfWorkMock.Object
        );
    }

    [Fact]
    public async Task Handle_ShouldFallbackToActiveTenant_WhenInvitedUserHasNoTenantMemberships()
    {
        // Arrange
        var hostId = Guid.NewGuid();
        var inviteeId = Guid.NewGuid();
        var fallbackTenantId = Guid.NewGuid();
        var meetingCode = "edg-test1234";

        var hostUser = new User
        {
            Id = hostId,
            FirstName = "Host",
            LastName = "User",
            Email = "host@example.com"
        };

        var inviteeUser = new User
        {
            Id = inviteeId,
            FirstName = "Invitee",
            LastName = "User",
            Email = "invitee@example.com"
        };

        var meeting = new Meeting
        {
            Id = Guid.NewGuid(),
            MeetingCode = meetingCode,
            Title = "Regional Meeting",
            HostUserId = hostId,
            TenantId = null // Host/meeting has no direct tenant
        };

        _currentUserServiceMock.Setup(s => s.UserId).Returns(hostId.ToString());
        _userRepositoryMock.Setup(u => u.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hostUser);

        _meetingRepositoryMock.Setup(m => m.GetByCodeAsync(meetingCode, It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        _meetingRepositoryMock.Setup(m => m.GetAllParticipantsAsync(meeting.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<MeetingParticipant>());

        _tenantRepositoryMock.Setup(t => t.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tenant>
            {
                new() { Id = fallbackTenantId, Name = "National Central Office", IsActive = true }
            });

        _userRepositoryMock.Setup(u => u.GetByIdAsync(inviteeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(inviteeUser);

        _tenantMemberRepositoryMock.Setup(t => t.GetMembersByUserAsync(inviteeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>()); // ZERO active tenant memberships

        _meetingRepositoryMock.Setup(m => m.GetByIdAsync(meeting.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(meeting);

        var command = new InviteMeetingParticipantsCommand(meetingCode, new List<Guid> { inviteeId });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        meeting.Participants.Should().ContainSingle(p => p.UserId == inviteeId);
        var addedParticipant = meeting.Participants.First(p => p.UserId == inviteeId);
        addedParticipant.TenantId.Should().Be(fallbackTenantId, "user with zero active tenant memberships must receive fallback active tenant ID");
        addedParticipant.IsDeleted.Should().BeFalse();
        addedParticipant.Role.Should().Be(ParticipantRole.Member);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldGracefullySetNullTenant_WhenNoTenantsExistInDatabase()
    {
        // Arrange
        var hostId = Guid.NewGuid();
        var inviteeId = Guid.NewGuid();
        var meetingCode = "edg-notenant123";

        var hostUser = new User { Id = hostId, FirstName = "Host", LastName = "User", Email = "host@example.com" };
        var inviteeUser = new User { Id = inviteeId, FirstName = "Invitee", LastName = "User", Email = "invitee@example.com" };
        var meeting = new Meeting { Id = Guid.NewGuid(), MeetingCode = meetingCode, Title = "Global Meeting", HostUserId = hostId, TenantId = null };

        _currentUserServiceMock.Setup(s => s.UserId).Returns(hostId.ToString());
        _userRepositoryMock.Setup(u => u.ResolveCurrentUserAsync(_currentUserServiceMock.Object, It.IsAny<CancellationToken>())).ReturnsAsync(hostUser);
        _meetingRepositoryMock.Setup(m => m.GetByCodeAsync(meetingCode, It.IsAny<CancellationToken>())).ReturnsAsync(meeting);
        _meetingRepositoryMock.Setup(m => m.GetAllParticipantsAsync(meeting.Id, It.IsAny<CancellationToken>())).ReturnsAsync(new List<MeetingParticipant>());
        _tenantRepositoryMock.Setup(t => t.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(new List<Tenant>()); // ZERO tenants exist
        _userRepositoryMock.Setup(u => u.GetByIdAsync(inviteeId, It.IsAny<CancellationToken>())).ReturnsAsync(inviteeUser);
        _tenantMemberRepositoryMock.Setup(t => t.GetMembersByUserAsync(inviteeId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<TenantMember>());
        _meetingRepositoryMock.Setup(m => m.GetByIdAsync(meeting.Id, It.IsAny<CancellationToken>())).ReturnsAsync(meeting);

        var command = new InviteMeetingParticipantsCommand(meetingCode, new List<Guid> { inviteeId });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        meeting.Participants.Should().ContainSingle(p => p.UserId == inviteeId);
        var addedParticipant = meeting.Participants.First(p => p.UserId == inviteeId);
        addedParticipant.TenantId.Should().BeNull("when no tenants exist anywhere, TenantId must gracefully be null instead of unexpected defaults");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
