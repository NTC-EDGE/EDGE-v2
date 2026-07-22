using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetStoredFilesByTenant;

public class GetStoredFilesByTenantQueryHandler : IRequestHandler<GetStoredFilesByTenantQuery, ApiResponse<List<StoredFileDto>>>
{
    private readonly IStoredFileRepository _fileRepository;

    public GetStoredFilesByTenantQueryHandler(IStoredFileRepository fileRepository)
    {
        _fileRepository = fileRepository;
    }

    public async Task<ApiResponse<List<StoredFileDto>>> Handle(GetStoredFilesByTenantQuery request, CancellationToken cancellationToken)
    {
        var files = await _fileRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var dtos = files.Select(f => new StoredFileDto(
            f.Id,
            f.FileName,
            f.ContentType,
            f.FileSizeBytes,
            f.Category,
            f.TenantId,
            f.UploadedByUserId,
            f.CreatedAt
        )).ToList();

        return ApiResponse<List<StoredFileDto>>.Success(dtos);
    }
}
