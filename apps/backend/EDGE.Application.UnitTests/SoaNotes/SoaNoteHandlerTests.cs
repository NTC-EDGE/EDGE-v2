using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.SoaNotes.Commands.CreateSoaNote;
using EDGE.Application.SoaNotes.Commands.UpdateSoaNote;
using EDGE.Application.SoaNotes.Commands.DeleteSoaNote;
using EDGE.Application.SoaNotes.Queries.GetAllSoaNotes;
using EDGE.Application.SoaNotes.Queries.GetSoaNoteById;

namespace EDGE.Application.UnitTests.SoaNotes;

public class SoaNoteHandlerTests
{
    private readonly Mock<ISoaNoteRepository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    [Fact]
    public async Task CreateSoaNoteCommandHandler_ShouldCreateAndReturnDto()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var handler = new CreateSoaNoteCommandHandler(_repositoryMock.Object, _unitOfWorkMock.Object);
        var command = new CreateSoaNoteCommand("Standard billing terms and conditions.", "TERMS_STD", "Standard Terms", tenantId);

        SoaNote? addedNote = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<SoaNote>(), It.IsAny<CancellationToken>()))
            .Callback<SoaNote, CancellationToken>((n, _) => addedNote = n)
            .Returns(Task.CompletedTask);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TenantId.Should().Be(tenantId);
        result.Code.Should().Be("TERMS_STD");
        result.Title.Should().Be("Standard Terms");
        result.Notes.Should().Be("Standard billing terms and conditions.");

        addedNote.Should().NotBeNull();
        addedNote!.TenantId.Should().Be(tenantId);
        addedNote.Code.Should().Be("TERMS_STD");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateSoaNoteCommandHandler_ShouldUpdateAndReturnDto_WhenFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var existingNote = new SoaNote
        {
            Id = noteId,
            TenantId = tenantId,
            Notes = "Old notes",
            Code = "OLD_CODE",
            Title = "Old Title"
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingNote);

        var handler = new UpdateSoaNoteCommandHandler(_repositoryMock.Object, _unitOfWorkMock.Object);
        var command = new UpdateSoaNoteCommand(noteId, "Updated notes content", "NEW_CODE", "New Title", tenantId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TenantId.Should().Be(tenantId);
        result.Notes.Should().Be("Updated notes content");
        result.Code.Should().Be("NEW_CODE");
        result.Title.Should().Be("New Title");

        existingNote.Notes.Should().Be("Updated notes content");
        existingNote.Code.Should().Be("NEW_CODE");
        existingNote.Title.Should().Be("New Title");
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateSoaNoteCommandHandler_ShouldThrowKeyNotFoundException_WhenNotFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SoaNote?)null);

        var handler = new UpdateSoaNoteCommandHandler(_repositoryMock.Object, _unitOfWorkMock.Object);
        var command = new UpdateSoaNoteCommand(noteId, "Updated notes", "CODE", "Title");

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task DeleteSoaNoteCommandHandler_ShouldDelete_WhenFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        var existingNote = new SoaNote { Id = noteId, Notes = "Delete me" };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingNote);

        var handler = new DeleteSoaNoteCommandHandler(_repositoryMock.Object, _unitOfWorkMock.Object);
        var command = new DeleteSoaNoteCommand(noteId);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        _repositoryMock.Verify(r => r.Delete(existingNote), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteSoaNoteCommandHandler_ShouldThrowKeyNotFoundException_WhenNotFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SoaNote?)null);

        var handler = new DeleteSoaNoteCommandHandler(_repositoryMock.Object, _unitOfWorkMock.Object);
        var command = new DeleteSoaNoteCommand(noteId);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task GetAllSoaNotesQueryHandler_ShouldReturnPaginatedResponse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var items = new List<SoaNote>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Code = "CODE1", Title = "Title 1", Notes = "Note 1" },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Code = "CODE2", Title = "Title 2", Notes = "Note 2" }
        };

        _repositoryMock
            .Setup(r => r.GetPagedAsync(1, 10, "search", tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((items, 2));

        var handler = new GetAllSoaNotesQueryHandler(_repositoryMock.Object);
        var query = new GetAllSoaNotesQuery(1, 10, "search", tenantId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.Data[0].TenantId.Should().Be(tenantId);
    }

    [Fact]
    public async Task GetSoaNoteByIdQueryHandler_ShouldReturnDto_WhenFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var note = new SoaNote { Id = noteId, TenantId = tenantId, Code = "TEST", Title = "Test Title", Notes = "Test Content" };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(note);

        var handler = new GetSoaNoteByIdQueryHandler(_repositoryMock.Object);
        var query = new GetSoaNoteByIdQuery(noteId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(noteId);
        result.TenantId.Should().Be(tenantId);
        result.Code.Should().Be("TEST");
        result.Title.Should().Be("Test Title");
    }

    [Fact]
    public async Task GetSoaNoteByIdQueryHandler_ShouldReturnNull_WhenNotFound()
    {
        // Arrange
        var noteId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SoaNote?)null);

        var handler = new GetSoaNoteByIdQueryHandler(_repositoryMock.Object);
        var query = new GetSoaNoteByIdQuery(noteId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}
