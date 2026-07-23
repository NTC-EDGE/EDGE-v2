using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetStoredFileById;

public record GetStoredFileByIdQuery(
    Guid FileId,
    Guid TenantId
) : IRequest<ApiResponse<StoredFileDto>>;
