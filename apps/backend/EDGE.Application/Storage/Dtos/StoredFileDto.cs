using System;

namespace EDGE.Application.Storage.Dtos;

public record StoredFileDto(
    Guid Id,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    string Category,
    Guid TenantId,
    string UploadedByUserId,
    DateTime CreatedAt
);
