using System;
using System.IO;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Commands.UploadFile;

public record UploadFileCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    string Category,
    Guid TenantId,
    string UploadedByUserId
) : IRequest<ApiResponse<StoredFileDto>>;
