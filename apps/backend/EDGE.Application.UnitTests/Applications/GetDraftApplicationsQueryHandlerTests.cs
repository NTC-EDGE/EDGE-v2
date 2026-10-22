using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Applications.Dtos;
using EDGE.Application.Applications.Queries.GetDraftApplications;
using EDGE.Application.Common.Interfaces;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.Applications;

public class GetDraftApplicationsQueryHandlerTests
{
    private readonly Mock<IApplicationFullRepository> _mockRepo;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly GetDraftApplicationsQueryHandler _handler;

    public GetDraftApplicationsQueryHandlerTests()
    {
        _mockRepo = new Mock<IApplicationFullRepository>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUserRepo = new Mock<IUserRepository>();

        _handler = new GetDraftApplicationsQueryHandler(
            _mockRepo.Object,
            _mockCurrentUserService.Object,
            _mockUserRepo.Object
        );
    }

    [Fact]
    public async Task Handle_UnauthenticatedUser_ReturnsFailedEnvelope()
    {
        // Arrange
        _mockCurrentUserService.Setup(u => u.UserId).Returns((string?)null);

        var query = new GetDraftApplicationsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeFalse();
        result.Message.Should().Contain("401 Unauthorized");
    }

    [Fact]
    public async Task Handle_NoCategoryFilter_ReturnsStronglyTypedSummaries()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());

        var categoryId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId, Name = "Exams", Code = "EXAM" };
        var service = new Service { Id = Guid.NewGuid(), Name = "Radio Operator Exam", ServiceCategory = category };
        var applicant = new Applicant { Id = Guid.NewGuid(), Service = service };

        var app1 = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Draft,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { Applicant = applicant }
            }
        };

        _mockRepo.Setup(r => r.GetUserDraftsAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Application> { app1 });

        var query = new GetDraftApplicationsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Summaries.Should().NotBeNull();
        result.Summaries!.Should().HaveCount(1);
        result.Summaries![0].ServiceCategoryCode.Should().Be("EXAM");
        result.Summaries![0].DraftCount.Should().Be(1);
        result.Data.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WithCategoryFilter_ReturnsStronglyTypedPagedItems()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockCurrentUserService.Setup(u => u.UserId).Returns(userId.ToString());

        var categoryId = Guid.NewGuid();
        var category = new ServiceCategory { Id = categoryId, Name = "Exams", Code = "EXAM" };
        var service = new Service { Id = Guid.NewGuid(), Name = "Radio Operator Exam", ServiceCategory = category };
        var applicant = new Applicant { Id = Guid.NewGuid(), Service = service };

        var app1 = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            Status = ApplicationStatus.Draft,
            ReferenceNumber = "REF-12345678",
            CreatedAt = DateTime.UtcNow,
            ApplicationApplicants = new List<ApplicationApplicant>
            {
                new ApplicationApplicant { Applicant = applicant }
            }
        };

        _mockRepo.Setup(r => r.GetUserDraftsAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Domain.Entities.Application> { app1 });

        var query = new GetDraftApplicationsQuery(CategoryId: categoryId, PageNumber: 1, PageSize: 5);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Succeeded.Should().BeTrue();
        result.Items.Should().NotBeNull();
        result.Items!.Should().HaveCount(1);
        result.Items![0].ReferenceNumber.Should().Be("REF-12345678");
        result.TotalCount.Should().Be(1);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(5);
        result.TotalPages.Should().Be(1);
        result.HasPreviousPage.Should().BeFalse();
        result.HasNextPage.Should().BeFalse();
    }
}
