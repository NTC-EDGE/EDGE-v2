using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormWorkspace;

public record GetFormWorkspaceQuery(Guid Id) : IRequest<ApiResponse<FormWorkspaceDto>>;
