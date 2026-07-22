using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetFileDownload;

public class GetFileDownloadQueryHandler : IRequestHandler<GetFileDownloadQuery, ApiResponse<FileDownloadDto>>
{
    private readonly IStoredFileRepository _fileRepository;
    private readonly IStorageService _storageService;
    private readonly IFileEncryptionService _encryptionService;
    private readonly ITenantRepository _tenantRepository;

    public GetFileDownloadQueryHandler(
        IStoredFileRepository fileRepository,
        IStorageService storageService,
        IFileEncryptionService encryptionService,
        ITenantRepository tenantRepository)
    {
        _fileRepository = fileRepository;
        _storageService = storageService;
        _encryptionService = encryptionService;
        _tenantRepository = tenantRepository;
    }

    public async Task<ApiResponse<FileDownloadDto>> Handle(GetFileDownloadQuery request, CancellationToken cancellationToken)
    {
        if (request.TenantId != Guid.Empty)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.TenantId, cancellationToken);
            if (tenant == null)
            {
                return ApiResponse<FileDownloadDto>.Fail($"Tenant with ID '{request.TenantId}' was not found.");
            }
        }

        var storedFile = await _fileRepository.GetByIdAsync(request.FileId, cancellationToken);
        if (storedFile == null)
        {
            return ApiResponse<FileDownloadDto>.Fail($"File with ID {request.FileId} was not found.");
        }

        if (request.TenantId != Guid.Empty && storedFile.TenantId != request.TenantId)
        {
            return ApiResponse<FileDownloadDto>.Fail("Access denied: File does not belong to your tenant context.");
        }

        var cipherStream = await _storageService.DownloadFileAsync(storedFile.StorageKey, cancellationToken);
        var iv = Convert.FromBase64String(storedFile.EncryptionIv);
        var tag = Convert.FromBase64String(storedFile.EncryptionTag);

        var decryptedStream = await _encryptionService.DecryptStreamAsync(cipherStream, iv, tag, cancellationToken);

        var dto = new FileDownloadDto(
            decryptedStream,
            storedFile.FileName,
            storedFile.ContentType,
            storedFile.FileSizeBytes
        );

        return ApiResponse<FileDownloadDto>.Success(dto);
    }
}
