using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Hangfire;
using Hangfire.Common;
using Hangfire.States;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;
using EDGE.Infrastructure.Services;

namespace EDGE.Application.UnitTests.Notifications;

public class QueuedApplicationEmailNotificationServiceTests
{
    [Fact]
    public async Task SendApplicationSubmittedAsync_ShouldEnqueueBackgroundJob_WithoutBlockingHttpRequest()
    {
        var bgClientMock = new Mock<IBackgroundJobClient>();
        bgClientMock
            .Setup(c => c.Create(It.IsAny<Job>(), It.IsAny<IState>()))
            .Returns("job-123");

        var scopeFactoryMock = new Mock<IServiceScopeFactory>();
        var sut = new QueuedApplicationEmailNotificationService(
            scopeFactoryMock.Object,
            NullLogger<QueuedApplicationEmailNotificationService>.Instance,
            bgClientMock.Object);

        var applicationId = Guid.NewGuid();
        await sut.SendApplicationSubmittedAsync(applicationId, CancellationToken.None);

        bgClientMock.Verify(
            c => c.Create(
                It.Is<Job>(j =>
                    j.Type == typeof(ApplicationEmailNotificationService) &&
                    j.Method.Name == nameof(ApplicationEmailNotificationService.SendApplicationSubmittedAsync) &&
                    j.Args.Count >= 1 &&
                    Equals(j.Args[0], applicationId)),
                It.IsAny<EnqueuedState>()),
            Times.Once);
    }
}
