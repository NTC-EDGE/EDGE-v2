using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetStoredFileById;

public class GetStoredFileByIdQueryHandler : IRequestHandler<GetStoredFileByIdQuery, ApiResponse<StoredFileDto>>
{
    private readonly IStoredFileRepository _fileRepository;

    public GetStoredFileByIdQueryHandler(IStoredFileRepository fileRepository)
    {
        _fileRepository = fileRepository;
    }

    public async Task<ApiResponse<StoredFileDto>> Handle(GetStoredFileByIdQuery request, CancellationToken cancellationToken)
    {
        var storedFile = await _fileRepository.GetByIdAsync(request.FileId, cancellationToken);
        if (storedFile == null)
        {
            return ApiResponse<StoredFileDto>.Fail($"File with ID {request.FileId} was not found.");
        }

        if (request.TenantId != Guid.Empty && storedFile.TenantId != request.TenantId)
        {
            return ApiResponse<StoredFileDto>.Fail("Access denied: File does not belong to your tenant context.");
        }

        var dto = new StoredFileDto(
            storedFile.Id,
            storedFile.FileName,
            storedFile.ContentType,
            storedFile.FileSizeBytes,
            storedFile.Category,
            storedFile.TenantId,
            storedFile.UploadedByUserId,
            storedFile.CreatedAt
        );

        return ApiResponse<StoredFileDto>.Success(dto);
    }
}
