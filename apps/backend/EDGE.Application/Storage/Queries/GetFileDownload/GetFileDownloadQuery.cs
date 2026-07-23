using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetFileDownload;

public record GetFileDownloadQuery(
    Guid FileId,
    Guid TenantId
) : IRequest<ApiResponse<FileDownloadDto>>;
