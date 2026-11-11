using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormByVariantId;

public record GetFormByVariantIdQuery(Guid VariantId) : IRequest<ApiResponse<FormDto>>;
