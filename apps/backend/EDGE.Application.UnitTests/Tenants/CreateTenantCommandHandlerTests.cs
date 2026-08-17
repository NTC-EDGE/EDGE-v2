using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Tenants.Commands;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Tenants;

public class CreateTenantCommandHandlerTests
{
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly CreateTenantCommandHandler _handler;

    public CreateTenantCommandHandlerTests()
    {
        _handler = new CreateTenantCommandHandler(_tenantRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldAlwaysSetIsActiveToFalse_WhenCreatingTenant()
    {
        // Arrange
        var regionId = Guid.NewGuid();
        var command = new CreateTenantCommand("New Region Office", "NTC-NEW", "Regional office description", regionId);

        _tenantRepositoryMock
            .Setup(t => t.GetByCodeAsync("NTC-NEW", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tenant?)null);

        Tenant? capturedTenant = null;
        _tenantRepositoryMock
            .Setup(t => t.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()))
            .Callback<Tenant, CancellationToken>((t, _) => capturedTenant = t)
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Region Office");
        result.Code.Should().Be("NTC-NEW");
        result.IsActive.Should().BeFalse("freshly created tenants must always have IsActive set to false");

        capturedTenant.Should().NotBeNull();
        capturedTenant!.IsActive.Should().BeFalse();

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenTenantCodeAlreadyExists()
    {
        // Arrange
        var regionId = Guid.NewGuid();
        var existingTenant = new Tenant { Id = Guid.NewGuid(), Code = "NTC-EXISTING", Name = "Existing Tenant" };
        var command = new CreateTenantCommand("New Office", "NTC-EXISTING", "Description", regionId);

        _tenantRepositoryMock
            .Setup(t => t.GetByCodeAsync("NTC-EXISTING", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTenant);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");

        _tenantRepositoryMock.Verify(t => t.AddAsync(It.IsAny<Tenant>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
