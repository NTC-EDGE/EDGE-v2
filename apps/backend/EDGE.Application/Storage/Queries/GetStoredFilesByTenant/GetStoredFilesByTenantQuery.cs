using System;
using System.Collections.Generic;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Storage.Dtos;

namespace EDGE.Application.Storage.Queries.GetStoredFilesByTenant;

public record GetStoredFilesByTenantQuery(
    Guid TenantId
) : IRequest<ApiResponse<List<StoredFileDto>>>;
