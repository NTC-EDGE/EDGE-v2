using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Roles.Commands;
using EDGE.Domain.Entities;

namespace EDGE.Application.UnitTests.Roles;

public class CreateRoleCommandHandlerTests
{
    private readonly Mock<IRoleRepository> _roleRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly CreateRoleCommandHandler _handler;

    public CreateRoleCommandHandlerTests()
    {
        _handler = new CreateRoleCommandHandler(
            _roleRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldCreateRole_WhenNameIsUniqueAndTenantExists()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST" };
        var command = new CreateRoleCommand("Custom Staff", "custom_staff", "Description", tenantId, false);

        _tenantRepositoryMock
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Custom Staff", tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Custom Staff");
        result.Key.Should().Be("custom_staff");
        result.TenantId.Should().Be(tenantId);

        _roleRepositoryMock.Verify(r => r.AddAsync(It.Is<Role>(role => role.Name == "Custom Staff" && role.TenantId == tenantId), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowInvalidOperationException_WhenRoleNameAlreadyExists()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST" };
        var command = new CreateRoleCommand("Evaluator", "evaluator", "Description", tenantId, false);

        _tenantRepositoryMock
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        _roleRepositoryMock
            .Setup(r => r.IsRoleNameUniqueAsync("Evaluator", tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists in this tenant or as a standard role*");

        _roleRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Role>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
