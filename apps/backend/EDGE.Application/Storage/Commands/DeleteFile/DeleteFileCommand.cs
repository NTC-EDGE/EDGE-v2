using System;
using MediatR;
using EDGE.Application.Common.Models;

namespace EDGE.Application.Storage.Commands.DeleteFile;

public record DeleteFileCommand(
    Guid FileId,
    Guid TenantId
) : IRequest<ApiResponse<bool>>;
