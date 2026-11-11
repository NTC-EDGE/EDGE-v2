using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Forms.Dtos;
using EDGE.Application.Forms.Queries.GetForms;
using EDGE.Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace EDGE.Application.UnitTests.Forms;

public class GetFormsQueryTests
{
    private readonly Mock<IFormRepository> _mockFormRepo = new();

    [Fact]
    public async Task Handle_GroupsMultipleVersionsByServiceId_ReturningOnePerApplicationType()
    {
        var serviceId = Guid.NewGuid();
        var service = new Service { Id = serviceId, Name = "Amateur Radio License", Code = "ARSL" };

        var formV1 = new Form
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            Service = service,
            Name = "Amateur Radio Form v1",
            Version = "1.0",
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            Sections = new List<FormSection>()
        };

        var formV2 = new Form
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            Service = service,
            Name = "Amateur Radio Form v2",
            Version = "2.0",
            IsActive = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            Sections = new List<FormSection>()
        };

        _mockFormRepo
            .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Form> { formV1, formV2 });

        var handler = new GetFormsQueryHandler(_mockFormRepo.Object);
        var result = await handler.Handle(new GetFormsQuery(), CancellationToken.None);

        result.Data.Should().HaveCount(1);
        var item = result.Data.First();
        item.ServiceId.Should().Be(serviceId);
        item.Version.Should().Be("1.0"); // Active version is primary
        item.IsActive.Should().BeTrue();
        item.AvailableVersions.Should().HaveCount(2);
        item.AvailableVersions.Select(v => v.Version).Should().Contain(new[] { "1.0", "2.0" });
    }
}
