using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDGE.Domain.Entities;
using EDGE.Application.Common.Interfaces;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Commands.UploadFile;

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, ApiResponse<StoredFileDto>>
{
    private readonly IStorageService _storageService;
    private readonly IFileEncryptionService _encryptionService;
    private readonly IStoredFileRepository _fileRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadFileCommandHandler(
        IStorageService storageService,
        IFileEncryptionService encryptionService,
        IStoredFileRepository fileRepository,
        IUnitOfWork unitOfWork)
    {
        _storageService = storageService;
        _encryptionService = encryptionService;
        _fileRepository = fileRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<StoredFileDto>> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        if (request.FileStream == null || request.FileStream.Length == 0)
        {
            return ApiResponse<StoredFileDto>.Fail("File stream is empty.");
        }

        var sanitizedFileName = Path.GetFileName(request.FileName);
        var category = string.IsNullOrWhiteSpace(request.Category) ? "general" : request.Category.ToLowerInvariant();
        var storageKey = $"tenants/{request.TenantId}/{category}/{Guid.NewGuid()}_{sanitizedFileName}";

        // 1. Encrypt stream with AES-256-GCM
        var encryptedResult = await _encryptionService.EncryptStreamAsync(request.FileStream, cancellationToken);

        // 2. Upload ciphertext stream to Cloudflare R2
        await _storageService.UploadFileAsync(storageKey, encryptedResult.EncryptedStream, "application/octet-stream", cancellationToken);

        // 3. Persist StoredFile DB entity
        var storedFile = new StoredFile
        {
            FileName = sanitizedFileName,
            ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? "application/octet-stream" : request.ContentType,
            FileSizeBytes = request.FileSizeBytes > 0 ? request.FileSizeBytes : request.FileStream.Length,
            StorageKey = storageKey,
            Category = category,
            EncryptionIv = Convert.ToBase64String(encryptedResult.Iv),
            EncryptionTag = Convert.ToBase64String(encryptedResult.Tag),
            TenantId = request.TenantId,
            UploadedByUserId = request.UploadedByUserId
        };

        await _fileRepository.AddAsync(storedFile, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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

        return ApiResponse<StoredFileDto>.Success(dto, "File encrypted and uploaded successfully.");
    }
}
