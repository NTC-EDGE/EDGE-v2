using MediatR;
using EDGE.Application.Common.Models;
using EDGE.Application.Forms.Dtos;

namespace EDGE.Application.Forms.Queries.GetFormFilterOptions;

public record GetFormFilterOptionsQuery() : IRequest<ApiResponse<FormFilterOptionsDto>>;
