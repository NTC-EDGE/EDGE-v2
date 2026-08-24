using System;
using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormById;

public record GetFormByIdQuery(Guid Id) : IRequest<ApiResponse<FormDto>>;
