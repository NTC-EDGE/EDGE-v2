using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.FieldOffices.Commands.CreateFieldOffice;
using EDGE.Domain.Entities;
using EDGE.Domain.Enums;

namespace EDGE.Application.UnitTests.FieldOffices;

public class CreateFieldOfficeCommandHandlerTests
{
    private readonly Mock<IFieldOfficeRepository> _repositoryMock = new();
    private readonly Mock<IGeographicRepository> _geographicRepositoryMock = new();
    private readonly Mock<ITenantMemberRepository> _tenantMemberRepositoryMock = new();
    private readonly Mock<ITenantRepository> _tenantRepositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly CreateFieldOfficeCommandHandler _handler;

    public CreateFieldOfficeCommandHandlerTests()
    {
        _handler = new CreateFieldOfficeCommandHandler(
            _repositoryMock.Object,
            _geographicRepositoryMock.Object,
            _tenantMemberRepositoryMock.Object,
            _tenantRepositoryMock.Object,
            _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldAlwaysSetIsActiveToFalse_WhenCreatingFieldOffice()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var regionId = Guid.NewGuid();
        var tenant = new Tenant { Id = tenantId, Name = "Test Tenant", Code = "TEST", RegionId = regionId };
        var region = new Region { Id = regionId, Name = "NCR", Code = "NCR" };

        _tenantRepositoryMock
            .Setup(t => t.GetByIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenant);

        _geographicRepositoryMock
            .Setup(g => g.GetRegionByIdAsync(regionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(region);

        _tenantMemberRepositoryMock
            .Setup(m => m.GetMembersByTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<TenantMember>());

        FieldOffice? savedFieldOffice = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<FieldOffice>(), It.IsAny<CancellationToken>()))
            .Callback<FieldOffice, CancellationToken>((fo, _) => savedFieldOffice = fo)
            .Returns(Task.CompletedTask);

        var command = new CreateFieldOfficeCommand(
            TenantId: tenantId,
            Name: "Quezon City Branch",
            Code: "FO-QC",
            Category: FieldOfficeCategory.Extension,
            Description: "QC branch office",
            RegionId: regionId,
            ProvinceId: null,
            Address: "QC City Hall",
            ContactPhone: "09123456789",
            ContactEmail: "qc@ntc.gov.ph",
            OfficerInChargeId: null
        );

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Quezon City Branch");
        result.Code.Should().Be("FO-QC");
        result.IsActive.Should().BeFalse("freshly created field office must always have IsActive set to false");

        savedFieldOffice.Should().NotBeNull();
        savedFieldOffice!.IsActive.Should().BeFalse();

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
